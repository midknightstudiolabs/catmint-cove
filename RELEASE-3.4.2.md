# Catmint Cove 3.4.2

- Fixed a brief black flash behind full-screen panels (Activities, Catdex, Shop, Journal): the
  adaptive performance monitor could recover mid-panel and trigger a canvas resize, blanking the
  Cove for a frame or two until the panel-open throttle caught back up. The monitor now ignores
  frame timing while any panel is open, same as it already does for the Café, so it can't fire
  a resize behind one.

Validation: reproduced and confirmed via frame-by-frame capture of a live session (Activities
panel open, idle) before the fix — the flash's timing and color matched the canvas going empty
and showing the stage's placeholder background. Local smoke test after the fix: no console
errors, panel open/close unaffected.
