# iOS 3.0.8 — Little Matches shuffle fix

Full Neo d310ee5 payload; retains all 3.0.7 features and saves.

- Start now begins the shuffle instead of skipping it.
- CSS tile movement for normal motion; gentle opacity cue when Reduce Motion is enabled.
- Prevent duplicate shuffle triggers; input stays disabled until shuffle completes.

Destination: iOS TestFlight only. No Android release tag.
Browser checks cover automatic/manual shuffle and both motion preferences. Physical iPhone verification remains necessary; local WebKit installation failed.
