mod hooks;
mod setup;
mod state;

use std::{
  collections::HashSet,
  sync::{Arc, Mutex},
};

use tauri::{
  menu::{Menu, MenuItem},
  tray::{MouseButton, MouseButtonState, TrayIcon, TrayIconBuilder, TrayIconEvent},
  AppHandle, Manager, State,
};
use tauri_plugin_store::StoreExt;

use setup::ensure_key;
use state::{
  get_bool_state, get_string_state, get_u32_state, get_u8_state, set_bool_state, set_string_state,
  set_u32_state, set_u8_state, AppState, WindowState,
};

#[tauri::command(rename_all = "snake_case")]
fn create_interrupt_window(state: State<'_, Arc<Mutex<WindowState>>>, app: AppHandle) {
  let monitors = app.available_monitors().unwrap();
  let state = Arc::clone(&state);

  std::thread::spawn(move || {
    for (i, monitor) in monitors.iter().enumerate() {
      let scale = monitor.scale_factor();
      let size = monitor.size();
      let position = monitor.position();
      let label = format!("interrupt_{}", i);

      {
        let mut lock = state.lock().unwrap();
        lock.open_interrupts.insert(label.clone());
      }

      let builder = tauri::WebviewWindowBuilder::new(
        &app,
        label.clone(),
        tauri::WebviewUrl::App("/interrupt".into()),
      )
      .title("eunoia-interrupt")
      .shadow(false)
      .visible(true)
      .focused(true)
      .position(position.x as f64 / scale, position.y as f64 / scale)
      .resizable(false)
      .inner_size(size.width as f64 / scale, size.height as f64 / scale)
      .transparent(true)
      .maximizable(false)
      .decorations(false)
      .skip_taskbar(true)
      .always_on_top(true)
      .visible_on_all_workspaces(true);

      let window = builder.build().unwrap();
      let state_for_event = Arc::clone(&state);
      let label_clone = label.clone();
      let window_clone = window.clone();

      window.on_window_event(move |event| match event {
        tauri::WindowEvent::CloseRequested { .. } => {
          let mut lock = state_for_event.lock().unwrap();
          lock.open_interrupts.remove(&label_clone);
        }
        tauri::WindowEvent::Focused(false) => {
          window_clone.set_focus().unwrap();
        }
        _ => {}
      });
    }
  });
}

fn build_tray(app: &AppHandle) -> tauri::Result<TrayIcon> {
  let quit_menu = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
  let menu = Menu::with_items(app, &[&quit_menu])?;

  TrayIconBuilder::new()
    .icon(app.default_window_icon().unwrap().clone())
    .menu(&menu)
    .show_menu_on_left_click(false)
    .on_menu_event(|app, event| match event.id.as_ref() {
      "quit" => {
        app.exit(0);
      }
      _ => {}
    })
    .on_tray_icon_event(|tray, event| match event {
      TrayIconEvent::Click {
        button: MouseButton::Left,
        button_state: MouseButtonState::Up,
        ..
      } => {
        let app_handle = tray.app_handle();
        let state: tauri::State<Arc<Mutex<WindowState>>> = app_handle.state();
        let open_interrupts = {
          let lock = state.lock().unwrap();
          !lock.open_interrupts.is_empty()
        };

        if !open_interrupts {
          if let Some(window) = app_handle.get_webview_window("main") {
            let _ = window.unminimize();
            let _ = window.show();
            let _ = window.set_focus();
          }
        }
      }
      _ => {}
    })
    .build(app)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_store::Builder::new().build())
    .plugin(
      tauri_plugin_log::Builder::new()
        .target(tauri_plugin_log::Target::new(
          tauri_plugin_log::TargetKind::LogDir {
            file_name: Some("eunoia".to_string()),
          },
        ))
        .level(if cfg!(debug_assertions) {
          log::LevelFilter::Debug
        } else {
          log::LevelFilter::Info
        })
        .max_file_size(5 * 1024 * 1024)
        .timezone_strategy(tauri_plugin_log::TimezoneStrategy::UseUtc)
        .rotation_strategy(tauri_plugin_log::RotationStrategy::KeepAll)
        .build(),
    )
    .manage(Mutex::new(AppState {
      total_session: 2,
      focus_session: 20,
      short_break: 5,
      long_break: 15,
      running_session: 0,
      total_second: 20 * 60,
      running_second: 20 * 60,
      is_running: false,
      is_first_open: true,
      state: "INACTIVE".to_string(),
    }))
    .manage(Arc::new(Mutex::new(WindowState {
      open_interrupts: HashSet::new(),
    })))
    .setup(|app| {
      let state_ref = app.state::<Mutex<AppState>>();
      let mut state = state_ref.lock().unwrap();

      let store = app.store("stored.json")?;

      state.total_session = ensure_key(&store, "total_session", state.total_session);
      state.focus_session = ensure_key(&store, "focus_session", state.focus_session);
      state.short_break = ensure_key(&store, "short_break", state.short_break);
      state.long_break = ensure_key(&store, "long_break", state.long_break);
      state.running_session = ensure_key(&store, "running_session", state.running_session);

      store.save().unwrap();
      store.close_resource();

      build_tray(app.handle())?;

      #[cfg(windows)]
      {
        let window_state = app.state::<Arc<Mutex<WindowState>>>();
        hooks::install_keyboard_hook(Arc::clone(&window_state));
      }

      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      get_u8_state,
      set_u8_state,
      get_u32_state,
      set_u32_state,
      get_bool_state,
      set_bool_state,
      get_string_state,
      set_string_state,
      create_interrupt_window
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
