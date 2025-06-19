use serde::{de::DeserializeOwned, Serialize};
use serde_json::json;
use tauri::Runtime;
use tauri_plugin_store::Store;

pub fn ensure_key<T, S>(store: &Store<S>, key: &str, fallback: T) -> T
where
  T: DeserializeOwned + Serialize + Clone,
  S: Runtime,
{
  let stored_value = store
    .get(key)
    .and_then(|v| v.get("value").cloned())
    .and_then(|val| serde_json::from_value(val).ok());

  match stored_value {
    Some(value) => value,
    None => {
      let _ = store.set(key, json!({ "value": fallback.clone() }));
      fallback
    }
  }
}
