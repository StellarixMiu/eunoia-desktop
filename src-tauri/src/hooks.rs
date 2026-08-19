use std::cell::RefCell;
use std::sync::{Arc, Mutex};

use windows::Win32::Foundation::{HINSTANCE, LPARAM, LRESULT, WPARAM};
use windows::Win32::UI::WindowsAndMessaging::{
  CallNextHookEx, GetMessageW, KBDLLHOOKSTRUCT, LLKHF_ALTDOWN, MSG, SetWindowsHookExW, WH_KEYBOARD_LL,
};

use crate::state::WindowState;

const VK_TAB: u32 = 0x09;
const VK_LWIN: u32 = 0x5B;
const VK_RWIN: u32 = 0x5C;

thread_local! {
  static STATE: RefCell<Option<Arc<Mutex<WindowState>>>> = const { RefCell::new(None) };
}

pub fn install_keyboard_hook(state: Arc<Mutex<WindowState>>) {
  std::thread::spawn(move || {
    STATE.with(|s| *s.borrow_mut() = Some(state));

    unsafe {
      let hook = match SetWindowsHookExW(WH_KEYBOARD_LL, Some(hook_callback), HINSTANCE::default(), 0) {
        Ok(hook) => hook,
        Err(e) => {
          log::error!("[ERROR] failed to install keyboard hook: {e}");
          return;
        }
      };

      let mut message = std::mem::zeroed::<MSG>();
      while GetMessageW(&mut message, None, 0, 0).as_bool() {

      }

      let _ = hook;
    }
  });
}

unsafe extern "system" fn hook_callback(code: i32, wparam: WPARAM, lparam: LPARAM) -> LRESULT {
  if code == 0 {
    let should_block = STATE.with(|s| {
      let borrow = s.borrow();
      let Some(state) = borrow.as_ref() else {
        return false
      };
      let has_interrupts = { !state.lock().unwrap().open_interrupts.is_empty() };
      if !has_interrupts {
        return false
      }

      let kbd = unsafe { &*(lparam.0 as *const KBDLLHOOKSTRUCT) };
      let is_alt_tab = kbd.vkCode == VK_TAB && kbd.flags.contains(LLKHF_ALTDOWN);
      let is_win_key = kbd.vkCode == VK_LWIN || kbd.vkCode == VK_RWIN;
      is_alt_tab || is_win_key
    });

    if should_block {
      return LRESULT(1)
    }
  }

  unsafe { CallNextHookEx(None, code, wparam, lparam) }
}
