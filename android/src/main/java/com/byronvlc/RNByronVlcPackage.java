package com.byronvlc;


import android.util.Log;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.JavaScriptModule;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class RNByronVlcPackage implements ReactPackage {

    private RNByronVlcManager playerManager;



    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        if (playerManager == null) {
            playerManager = new RNByronVlcManager(reactContext);
            Log.i("NativeModule", "CreateViewManager" );

        }

        return Arrays.<NativeModule>asList(
                new RNByronVlcModule(reactContext, playerManager)
        );

    }

    public List<Class<? extends JavaScriptModule>> createJSModules() {
        return Collections.emptyList();
    }

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {

        if (playerManager == null) {
            playerManager = new RNByronVlcManager(reactContext);
            Log.i("NativeModule", "CreateViewMan" );
        }
        return Arrays.<ViewManager>asList(
                playerManager
        );

    }

}
