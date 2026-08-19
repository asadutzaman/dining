package com.khaidai.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.getValue
import androidx.compose.runtime.collectAsState
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.khaidai.core.data.session.SessionStore
import com.khaidai.core.designsystem.theme.KhaiDaiTheme
import dagger.hilt.android.AndroidEntryPoint
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import javax.inject.Inject

/**
 * Owns only the question the navigation graph needs before it can start: is
 * anyone signed in? Null means "not known yet", which keeps the app from
 * flashing the sign-in screen while DataStore is still reading.
 */
@HiltViewModel
class SessionViewModel @Inject constructor(
    sessionStore: SessionStore,
) : ViewModel() {

    val isSignedIn: StateFlow<Boolean?> = sessionStore.isSignedIn
        .stateIn(viewModelScope, SharingStarted.Eagerly, null)
}

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)

        setContent {
            KhaiDaiTheme {
                val viewModel: SessionViewModel = androidx.hilt.navigation.compose.hiltViewModel()
                val isSignedIn by viewModel.isSignedIn.collectAsState()

                KhaiDaiApp(isSignedIn = isSignedIn)
            }
        }
    }
}
