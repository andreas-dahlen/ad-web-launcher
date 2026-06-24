package com.ad.launcher

import android.content.Context
import android.content.Intent
import android.util.Log
import android.webkit.JavascriptInterface

class JSBridge(private val context: Context) {

    @JavascriptInterface
    fun openApp(packageName: String) {
        val intent = context.packageManager.getLaunchIntentForPackage(packageName)
        if (intent != null) {
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(intent)
        } else {
            Log.w("JSBridge", "No launch intent for package: $packageName")
        }
    }
}