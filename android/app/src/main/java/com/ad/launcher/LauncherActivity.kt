<<<<<<< HEAD:ADWebWallpaper/app/src/main/java/com/ad/webwallpaper/LauncherActivity.kt
package com.ad.webwallpaper
=======
package com.ad.launcher
>>>>>>> dev:android/app/src/main/java/com/ad/launcher/LauncherActivity.kt

import android.annotation.SuppressLint
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
<<<<<<< HEAD:ADWebWallpaper/app/src/main/java/com/ad/webwallpaper/LauncherActivity.kt
import android.view.Choreographer
=======
>>>>>>> dev:android/app/src/main/java/com/ad/launcher/LauncherActivity.kt
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
<<<<<<< HEAD:ADWebWallpaper/app/src/main/java/com/ad/webwallpaper/LauncherActivity.kt
=======
import androidx.activity.OnBackPressedCallback
>>>>>>> dev:android/app/src/main/java/com/ad/launcher/LauncherActivity.kt
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
<<<<<<< HEAD:ADWebWallpaper/app/src/main/java/com/ad/webwallpaper/LauncherActivity.kt
=======
import java.util.Locale
>>>>>>> dev:android/app/src/main/java/com/ad/launcher/LauncherActivity.kt

class LauncherActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private val handler = Handler(Looper.getMainLooper())
<<<<<<< HEAD:ADWebWallpaper/app/src/main/java/com/ad/webwallpaper/LauncherActivity.kt
    private val choreographer = Choreographer.getInstance()

    private val baseWidth = 364f
    private val baseHeight = 800f

    // =========================================================================
    // PERFORMANCE: Throttle move events to reduce JS bridge overhead
    // =========================================================================
    private var lastMoveTime = 0L
    private val moveThrottleMs = 16L  // ~60fps for move events

    // Gesture sequence ID to ignore stale events
    private var gestureSeqId = 0

    // Track if we're in an active gesture (for frame scheduling)
    private var isGestureActive = false

    // Frame throttling to keep battery usage low while allowing animations
    private val frameThrottleMs = 33L  // ~30fps cap for CSS animations
    private var lastFrameTimeMs = 0L
    private var frameCallback: Choreographer.FrameCallback? = null

    private var isForeground = false
=======

    private var deviceWidthPx = 0f
    private var deviceHeightPx = 0f
    private var deviceDensity = 1f
>>>>>>> dev:android/app/src/main/java/com/ad/launcher/LauncherActivity.kt

    // =========================================================================
    // Lifecycle
    // =========================================================================
<<<<<<< HEAD:ADWebWallpaper/app/src/main/java/com/ad/webwallpaper/LauncherActivity.kt
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enterImmersiveMode()
        setupWebView()
=======

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        captureDeviceMetrics()
        enterImmersiveMode()
        setupWebView()
        setupBackHandler()
>>>>>>> dev:android/app/src/main/java/com/ad/launcher/LauncherActivity.kt
    }

    override fun onResume() {
        super.onResume()
<<<<<<< HEAD:ADWebWallpaper/app/src/main/java/com/ad/webwallpaper/LauncherActivity.kt
        isForeground = true
        webView.onResume()
        startFrameLoop()
    }

    override fun onPause() {
        stopFrameLoop()
        webView.onPause()
        isForeground = false
=======
        captureDeviceMetrics()
        injectDeviceMetrics()
        webView.onResume()
        evalJS("window.__onLifecycle?.('resume')")
    }

    override fun onPause() {
        evalJS("window.__onLifecycle?.('pause')")
        webView.onPause()
>>>>>>> dev:android/app/src/main/java/com/ad/launcher/LauncherActivity.kt
        super.onPause()
    }

    override fun onDestroy() {
        handler.removeCallbacksAndMessages(null)
<<<<<<< HEAD:ADWebWallpaper/app/src/main/java/com/ad/webwallpaper/LauncherActivity.kt
        stopFrameLoop()
=======
>>>>>>> dev:android/app/src/main/java/com/ad/launcher/LauncherActivity.kt
        webView.destroy()
        super.onDestroy()
    }

    // =========================================================================
    // UI setup
    // =========================================================================
<<<<<<< HEAD:ADWebWallpaper/app/src/main/java/com/ad/webwallpaper/LauncherActivity.kt
=======

>>>>>>> dev:android/app/src/main/java/com/ad/launcher/LauncherActivity.kt
    private fun enterImmersiveMode() {
        WindowCompat.setDecorFitsSystemWindows(window, false)
        WindowInsetsControllerCompat(window, window.decorView).apply {
            hide(WindowInsetsCompat.Type.systemBars())
            systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        }
    }

<<<<<<< HEAD:ADWebWallpaper/app/src/main/java/com/ad/webwallpaper/LauncherActivity.kt
    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        webView = WebView(this).apply {
            // =========================================================
            // CRITICAL: Enable hardware acceleration for smooth animations
            // =========================================================
=======
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
>>>>>>> dev:android/app/src/main/java/com/ad/launcher/LauncherActivity.kt
            setLayerType(View.LAYER_TYPE_HARDWARE, null)

            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
<<<<<<< HEAD:ADWebWallpaper/app/src/main/java/com/ad/webwallpaper/LauncherActivity.kt

            // Additional WebView optimizations
=======
>>>>>>> dev:android/app/src/main/java/com/ad/launcher/LauncherActivity.kt
            settings.useWideViewPort = false
            settings.loadWithOverviewMode = false
            settings.setSupportZoom(false)
            settings.builtInZoomControls = false

            setBackgroundColor(0)

            webViewClient = object : WebViewClient() {
                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
<<<<<<< HEAD:ADWebWallpaper/app/src/main/java/com/ad/webwallpaper/LauncherActivity.kt
=======
                    injectDeviceMetrics()
>>>>>>> dev:android/app/src/main/java/com/ad/launcher/LauncherActivity.kt
                    initializeGestureEngine()
                }
            }
            webChromeClient = WebChromeClient()

            addJavascriptInterface(JSBridge(applicationContext), "Android")
            loadUrl("file:///android_asset/index.html")
        }

<<<<<<< HEAD:ADWebWallpaper/app/src/main/java/com/ad/webwallpaper/LauncherActivity.kt
        webView.setOnTouchListener { _, event ->
            handleTouch(event)
            true
        }

=======
>>>>>>> dev:android/app/src/main/java/com/ad/launcher/LauncherActivity.kt
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
<<<<<<< HEAD:ADWebWallpaper/app/src/main/java/com/ad/webwallpaper/LauncherActivity.kt
    // Touch handling mirrors previous launcher gesture pipeline
    // =========================================================================
    private fun handleTouch(event: MotionEvent) {
        val w = (webView.width.takeIf { it > 0 } ?: webView.measuredWidth).toFloat()
        val h = (webView.height.takeIf { it > 0 } ?: webView.measuredHeight).toFloat()

        // Fallback to display metrics if layout is still measuring
        val width = if (w > 0f) w else resources.displayMetrics.widthPixels.toFloat()
        val height = if (h > 0f) h else resources.displayMetrics.heightPixels.toFloat()

        val normX = (event.x / width) * baseWidth
        val normY = (event.y / height) * baseHeight

        when (event.actionMasked) {
            MotionEvent.ACTION_DOWN -> {
                gestureSeqId++
                isGestureActive = true
                lastMoveTime = 0L

                // Ensure frame loop is running during interaction
                startFrameLoop()

                sendToJS("down", normX, normY)
            }

            MotionEvent.ACTION_MOVE -> {
                if (!isGestureActive) return
                val now = SystemClock.uptimeMillis()
                if (now - lastMoveTime >= moveThrottleMs) {
                    lastMoveTime = now
                    sendToJS("move", normX, normY)
                }
            }

            MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                // Send final position (in case last move was throttled)
                sendToJS("move", normX, normY)

                // JS commits or rejects the swipe; CSS transitions handle animation
                sendToJS("up", normX, normY)

                isGestureActive = false
                lastMoveTime = 0L

                // Final redraw after gesture completes
                handler.postDelayed({
                    needsRedraw = true
                }, 50)
            }
        }
    }

    /**
     * Send gesture event to JavaScript.
     * Minimal overhead: just the essential data.
     */
    private fun sendToJS(type: String, normX: Float, normY: Float) {
        webView.evaluateJavascript(
            "handleTouch('$type',$normX,$normY,$gestureSeqId)",
            null
        )
        needsRedraw = true
        // Ensure animations keep running during gesture-driven updates
        if (isGestureActive) startFrameLoop()
    }

    // =========================================================================
    // PERFORMANCE: Continuous but throttled rendering for CSS animations
    // =========================================================================
    private var needsRedraw = true

    /**
     * Start a light frame loop driven by Choreographer to keep CSS animations alive.
     */
    private fun startFrameLoop() {
        if (frameCallback != null) return

        frameCallback = Choreographer.FrameCallback {
            val now = SystemClock.uptimeMillis()
            if (now - lastFrameTimeMs >= frameThrottleMs) {
                lastFrameTimeMs = now
                if (needsRedraw) {
                    webView.invalidate() 

// This works (webView.invalidate() — but note:

// WebView already schedules its own draws

// Invalidating manually is fine only because you throttle it

// 🟡 Keep this, but:

// If you later see redundant frames, this is the first place to look

// Never call this unthrottled




                    needsRedraw = false
                }
            }

            if (isForeground) {
                choreographer.postFrameCallback(frameCallback!!)
            } else {
                frameCallback = null
            }
        }

        choreographer.postFrameCallback(frameCallback!!)
    }

    /**
     * Stop the frame loop when the launcher is backgrounded.
     */
    private fun stopFrameLoop() {
        frameCallback?.let { choreographer.removeFrameCallback(it) }
        frameCallback = null
    }

    /**
     * Initialize gesture engine with simple retry logic.
     */
    private fun initializeGestureEngine(attempt: Int = 1) {
        webView.evaluateJavascript(
            """
                (function() {
                    if (typeof window.initAndroidEngine === 'function') {
                        return window.initAndroidEngine();
                    }
                    return 'not_ready';
                })();
            """.trimIndent()
        ) { result ->
            when {
                result?.contains("success") == true -> {
                    needsRedraw = true
                    startFrameLoop()
                }
                attempt < 3 -> {
                    handler.postDelayed({ initializeGestureEngine(attempt + 1) }, 100L * attempt)
                }
=======
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
>>>>>>> dev:android/app/src/main/java/com/ad/launcher/LauncherActivity.kt
            }
        }
    }
}
