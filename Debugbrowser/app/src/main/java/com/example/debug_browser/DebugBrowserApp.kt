package com.example.debug_browser

import android.app.Application
import android.webkit.WebView

class DebugBrowserApp : Application() {
    override fun onCreate() {
        super.onCreate()
        WebView.setWebContentsDebuggingEnabled(true)
    }
}
