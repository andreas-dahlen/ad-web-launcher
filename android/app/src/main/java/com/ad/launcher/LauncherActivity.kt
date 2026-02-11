package com.ad.launcher

import android.annotation.SuppressLint
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import java.util.Locale

class LauncherActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private val handler = Handler(Looper.getMainLooper())

    private var deviceWidthPx = 0f
    private var deviceHeightPx = 0f
    private var deviceDensity = 1f

    // Move throttling (~60fps)
    private var lastMoveTime = 0L
    private val moveThrottleMs = 16L

    private var gestureSeqId = 0
    private var isGestureActive = false

    // =========================================================================
    // Lifecycle
    // =========================================================================

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        captureDeviceMetrics()
        enterImmersiveMode()
        setupWebView()
        setupBackHandler()
    }

    override fun onResume() {
        super.onResume()
        captureDeviceMetrics()
        injectDeviceMetrics()
        webView.onResume()
        evalJS("window.__onLifecycle?.('resume')")
    }

    override fun onPause() {
        evalJS("window.__onLifecycle?.('pause')")
        webView.onPause()
        super.onPause()
    }

    override fun onDestroy() {
        handler.removeCallbacksAndMessages(null)
        webView.destroy()
        super.onDestroy()
    }

    // =========================================================================
    // UI setup
    // =========================================================================

    private fun enterImmersiveMode() {
        WindowCompat.setDecorFitsSystemWindows(window, false)
        WindowInsetsControllerCompat(window, window.decorView).apply {
            hide(WindowInsetsCompat.Type.systemBars())
            systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        }
    }

    private fun setupBackHandler() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                evalJS("window.__onBackPressed?.()")
            }
        })
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        webView = WebView(this).apply {
            setLayerType(View.LAYER_TYPE_HARDWARE, null)

            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.useWideViewPort = false
            settings.loadWithOverviewMode = false
            settings.setSupportZoom(false)
            settings.builtInZoomControls = false

            setBackgroundColor(0)

            webViewClient = object : WebViewClient() {
                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    injectDeviceMetrics()
                    initializeGestureEngine()
                }
            }
            webChromeClient = WebChromeClient()

            addJavascriptInterface(JSBridge(applicationContext), "Android")
            loadUrl("file:///android_asset/index.html")
        }

        webView.setOnTouchListener { _, event ->
            handleTouch(event)
            true
        }

        val container = FrameLayout(this).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            addView(webView, FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            ))
        }

        setContentView(container)
    }

    // =========================================================================
    // Touch → JS forwarding
    // =========================================================================

    private fun handleTouch(event: MotionEvent) {
        val cssX = event.x / deviceDensity
        val cssY = event.y / deviceDensity

        when (event.actionMasked) {
            MotionEvent.ACTION_DOWN -> {
                gestureSeqId++
                isGestureActive = true
                lastMoveTime = 0L
                sendToJS("down", cssX, cssY)
            }

            MotionEvent.ACTION_MOVE -> {
                if (!isGestureActive) return
                val now = SystemClock.uptimeMillis()
                if (now - lastMoveTime >= moveThrottleMs) {
                    lastMoveTime = now
                    sendToJS("move", cssX, cssY)
                }
            }

            MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                sendToJS("move", cssX, cssY)
                sendToJS("up", cssX, cssY)
                isGestureActive = false
                lastMoveTime = 0L
            }
        }
    }

    private fun sendToJS(type: String, cssX: Float, cssY: Float) {
        evalJS("handleTouch('$type',$cssX,$cssY,$gestureSeqId)")
    }

    // =========================================================================
    // Device metrics
    // =========================================================================

    private fun captureDeviceMetrics() {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.R) {
            val metrics = windowManager.currentWindowMetrics
            val bounds = metrics.bounds
            deviceWidthPx = bounds.width().toFloat()
            deviceHeightPx = bounds.height().toFloat()
            deviceDensity = resources.displayMetrics.density
        } else {
            val metrics = resources.displayMetrics
            deviceWidthPx = metrics.widthPixels.toFloat()
            deviceHeightPx = metrics.heightPixels.toFloat()
            deviceDensity = metrics.density
        }
    }

    private fun injectDeviceMetrics() {
        val cssWidth = (deviceWidthPx / deviceDensity).toInt()
        val cssHeight = (deviceHeightPx / deviceDensity).toInt()
        val density = String.format(Locale.US, "%.4f", deviceDensity)

        evalJS("""
            (function() {
                window.__DEVICE = { width: $cssWidth, height: $cssHeight, density: $density, platform: 'android' };
            })();
        """.trimIndent())
    }

    // =========================================================================
    // JS helpers
    // =========================================================================

    private fun evalJS(script: String) {
        webView.evaluateJavascript(script, null)
    }

    private fun initializeGestureEngine(attempt: Int = 1) {
        webView.evaluateJavascript("""
            (function() {
                if (typeof window.initAndroidEngine === 'function') {
                    return window.initAndroidEngine();
                }
                return 'not_ready';
            })();
        """.trimIndent()) { result ->
            if (result?.contains("not_ready") == true && attempt < 3) {
                handler.postDelayed({ initializeGestureEngine(attempt + 1) }, 100L * attempt)
            }
        }
    }
}
