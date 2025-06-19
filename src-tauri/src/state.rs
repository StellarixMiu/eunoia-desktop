use std::{collections::HashSet, sync::Mutex};

use serde::{Deserialize, Serialize};
use serde_json::json;
use tauri::{AppHandle, Emitter, State};
use tauri_plugin_store::StoreExt;

#[derive(Serialize, Deserialize)]
pub struct WindowState {
  pub open_interrupts: HashSet<String>,
}

#[derive(Serialize, Deserialize)]
pub struct AppState {
  pub total_session: u8,
  pub focus_session: u8,
  pub short_break: u8,
  pub long_break: u8,
  pub running_session: u8,
  pub total_second: u32,
  pub running_second: u32,
  pub is_running: bool,
  pub is_first_open: bool,
  pub state: String,
}

#[tauri::command(rename_all = "snake_case")]
pub fn get_u8_state(state: State<'_, Mutex<AppState>>, key: String) -> u8 {
  let state = state.lock().unwrap();

  match key.as_str() {
    "total_session" => return state.total_session,
    "focus_session" => return state.focus_session,
    "short_break" => return state.short_break,
    "long_break" => return state.long_break,
    "running_session" => return state.running_session,
    _ => 0,
  }
}

#[tauri::command(rename_all = "snake_case")]
pub fn set_u8_state(
  state: State<'_, Mutex<AppState>>,
  app: AppHandle,
  key: String,
  value: u8,
) -> bool {
  let mut state = state.lock().unwrap();

  match key.as_str() {
    "total_session" => state.total_session = value,
    "focus_session" => state.focus_session = value,
    "short_break" => state.short_break = value,
    "long_break" => state.long_break = value,
    "running_session" => state.running_session = value,
    _ => return false,
  }

  if let Ok(store) = app.store("stored.json") {
    store.set(&key, json!({ "value": value }));
    store.save().unwrap();

    store.close_resource();
  };

  app
    .emit(
      "data_changed",
      json!({
        "key":key,
        "value":value
      }),
    )
    .unwrap();

  true
}

#[tauri::command(rename_all = "snake_case")]
pub fn get_u32_state(state: State<'_, Mutex<AppState>>, key: String) -> u32 {
  let state = state.lock().unwrap();

  match key.as_str() {
    "total_second" => return state.total_second,
    "running_second" => return state.running_second,
    _ => 0,
  }
}

#[tauri::command(rename_all = "snake_case")]
pub fn set_u32_state(
  state: State<'_, Mutex<AppState>>,
  app: AppHandle,
  key: String,
  value: u32,
) -> bool {
  let mut state = state.lock().unwrap();

  match key.as_str() {
    "total_second" => state.total_second = value,
    "running_second" => state.running_second = value,
    _ => return false,
  };

  app
    .emit(
      "data_changed",
      json!({
        "key":key,
        "value":value
      }),
    )
    .unwrap();

  true
}

#[tauri::command(rename_all = "snake_case")]
pub fn get_bool_state(state: State<'_, Mutex<AppState>>, key: String) -> bool {
  let state = state.lock().unwrap();

  match key.as_str() {
    "is_running" => return state.is_running,
    "is_first_open" => return state.is_first_open,
    _ => false,
  }
}

#[tauri::command(rename_all = "snake_case")]
pub fn set_bool_state(
  state: State<'_, Mutex<AppState>>,
  app: AppHandle,
  key: String,
  value: bool,
) -> bool {
  let mut state = state.lock().unwrap();

  match key.as_str() {
    "is_running" => state.is_running = value,
    "is_first_open" => state.is_first_open = value,
    _ => return false,
  };

  app
    .emit(
      "data_changed",
      json!({
        "key":key,
        "value":value
      }),
    )
    .unwrap();

  true
}

#[tauri::command(rename_all = "snake_case")]
pub fn get_string_state(state: State<'_, Mutex<AppState>>, key: String) -> String {
  let state = state.lock().unwrap();

  match key.as_str() {
    "state" => return state.state.clone(),
    _ => format!("INACTIVE"),
  }
}

#[tauri::command(rename_all = "snake_case")]
pub fn set_string_state(
  state: State<'_, Mutex<AppState>>,
  app: AppHandle,
  key: String,
  value: String,
) -> bool {
  let mut state = state.lock().unwrap();

  match key.as_str() {
    "state" => state.state = value.clone(),
    _ => return false,
  };

  app
    .emit(
      "data_changed",
      json!({
        "key":key,
        "value":value
      }),
    )
    .unwrap();

  true
}
