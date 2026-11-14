# Standard Defect & Bug Report Template
**Project:** Retro Brick Game Console (23-in-1 Handheld LCD Emulator)  
**QA Standards:** ISO/IEC/IEEE 29119-3 Standard Software Test Documentation

---

## Bug Report Fields

| Field | Description / Allowed Values |
| :--- | :--- |
| **Bug ID** | Unique tracking identifier (Format: `BUG-RBC-[CATEGORY]-[NUMBER]`, e.g., `BUG-RBC-DUO-001`) |
| **Title** | Concise summary of the issue (Max 120 characters) |
| **Severity** | Impact on console functionality:<br>• **Critical (S1)**: Crash, infinite loop, memory leak, total game blockage, save data corruption.<br>• **High (S2)**: Major feature broken, multiplayer desync/crosstalk, broken win/loss condition.<br>• **Medium (S3)**: Minor gameplay glitch, visual artifact, non-critical audio hitch, accessibility flaw.<br>• **Low (S4)**: Cosmetic inconsistency, typo, minor margin misalignment. |
| **Priority** | Urgency of resolution:<br>• **P1 (Immediate)**: Must fix before next build / release blocker.<br>• **P2 (High)**: Fix within current sprint / before release candidate.<br>• **P3 (Normal)**: Fix when time permits.<br>• **P4 (Low)**: Deferred / nice to have. |
| **Environment** | Operating system and runtime environment (e.g., Windows 11 Desktop, macOS Sonoma, iOS 17 Mobile Safari, Render Production Preview) |
| **Browser / Device** | Browser brand, major version, viewport dimensions (e.g., Edge 122.0 / $1920 \times 1080$, Safari Mobile / $393 \times 852$) |
| **Game / Module** | Specific game name (e.g., `BounceDuel`, `GridTactics`) or engine component (`Engine.js`, `InputController.js`, `SoundSystem.js`) |
| **Assigned Owner** | Engineer responsible for resolution |
| **Status** | `New` \| `Confirmed` \| `In Progress` \| `Fixed (Pending QA)` \| `Verified & Closed` \| `Deferred` |

---

## Bug Report Example

```markdown
### [BUG-RBC-DUO-001] ReflexRush false start allows second player to trigger win condition

- **Bug ID**: BUG-RBC-DUO-001
- **Severity**: High (S2)
- **Priority**: P1 (Blocker for Duo Mode)
- **Environment**: Windows 11 Desktop / Render Preview URL
- **Browser/Device**: Microsoft Edge 122.0.2365.92 / 1920x1080
- **Game / Module**: src/js/games/ReflexRush.js

#### Description
When playing ReflexRush in Duo Mode, if Player 1 strikes prematurely during the countdown (False Start), Player 2 is awarded the point. However, if Player 2 subsequently taps their action key before the round reset timer expires, the win condition is evaluated a second time, awarding an extra point.

#### Steps to Reproduce
1. Launch the console and select Duo Mode.
2. Select and start Game 23 (ReflexRush).
3. During the initial 3-second countdown (before the signal flashes), press `Space` (Player 1 false start).
4. Within 200ms, press `Enter` (Player 2).
5. Observe the scoreboard on the HUD.

#### Expected Result
Player 2 should receive exactly +1 point for Player 1's false start, and the round should lock until the next challenge begins.

#### Actual Result
Player 2 receives +2 points (one for P1's penalty, and a second for P2's trigger).

#### Console Output
```text
[Engine] ReflexRush false start triggered by P1.
[Engine] ReflexRush point awarded to P2. Score: 2.
```

#### Fix & Verification
- **Root Cause**: `roundResolved` flag was not set synchronously upon false start penalty evaluation.
- **Resolution**: Set `this.roundResolved = true` immediately in the penalty block before scheduling the reset timer.
- **Verification**: Verified via `tests/DuoMode.test.js` (Test: `ReflexRush Duo mode handles premature false start without double-scoring`). Status updated to **Verified & Closed**.
```
