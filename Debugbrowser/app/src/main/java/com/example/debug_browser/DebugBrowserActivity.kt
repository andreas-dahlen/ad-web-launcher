package com.example.debug_browser

import android.os.Bundle
import android.util.Log
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.EditText
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity

class DebugBrowserActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var urlInput: EditText
    private lateinit var loadButton: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_debug_browser)

        webView = findViewById(R.id.webView)
        urlInput = findViewById(R.id.urlInput)
        loadButton = findViewById(R.id.loadButton)

        setupWebView()

        // Default URL – you can change this to your dev server or file://
        urlInput.setText("https://example.com")
        loadUrl(urlInput.text.toString())

        loadButton.setOnClickListener {
            val url = urlInput.text.toString().trim()
            if (url.isNotEmpty()) {
                loadUrl(url)
            }
        }

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })
    }

    private fun setupWebView() {
        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.allowFileAccess = true
        settings.allowContentAccess = true

        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                Log.d("DebugBrowser", "Page finished: $url")
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onConsoleMessage(message: android.webkit.ConsoleMessage?): Boolean {
                Log.d(
                    "WebViewConsole",
                    "${message?.message()} @ ${message?.sourceId()}:${message?.lineNumber()}"
                )
                return true
            }
        }
    }

    private fun loadUrl(url: String) {
        // If user types something without scheme, assume http
        val finalUrl = if (!url.startsWith("http://") &&
            !url.startsWith("https://") &&
            !url.startsWith("file://")
        ) {
            "http://$url"
        } else {
            url
        }

        Log.d("DebugBrowser", "Loading: $finalUrl")
        webView.loadUrl(finalUrl)
    }


}
