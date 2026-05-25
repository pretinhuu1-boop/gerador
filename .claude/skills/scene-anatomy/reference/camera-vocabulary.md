# Camera Vocabulary — closed list

Pick from this list when filling the `[CAM]` slot. Don't invent new terms —
Seedance 2.0 has been trained on these exact phrases via cinematic
references. Mixing them with invented vocabulary degrades output quality.

## Shot sizes

| Code | Name | Use |
|---|---|---|
| `XWS` / `EWS` | Extreme Wide Shot | Establishing geography, scale, isolation |
| `WS` | Wide Shot | Full body + environment |
| `MS` | Medium Shot | Knees / waist up; conversation default |
| `MCU` | Medium Close-Up | Chest up; "talking head" |
| `CU` | Close-Up | Head + shoulders; emotion beat |
| `TCU` | Tight Close-Up (telephoto) | Face fills frame; compressed perspective |
| `XCU` / `ECU` | Extreme Close-Up | Single feature (eyes, hands) |

## Camera movement (22 techniques)

Pick **one** per shot. Don't combine.

| Movement | Phrasing | Pace cue |
|---|---|---|
| Lock-Off Static | `STATIC` or `LOCKOFF` | Observational, contemplative |
| Dolly Forward | `DOLLY FORWARD` / `PUSH-IN` | Builds intimacy; ~2 ft/s |
| Dolly Backward | `DOLLY BACKWARD` / `PULL-OUT` / `SLOW DOLLY-OUT` | Reveals context; closing shot |
| Truck Left/Right | `TRUCK LEFT` / `TRUCK RIGHT` | Lateral 10 ft showing environment |
| Pan Left/Right | `PAN LEFT` / `PAN RIGHT` | Horizontal rotate; 30°/s |
| Tilt Up/Down | `TILT UP` / `TILT DOWN` | Vertical rotate; 20°/s |
| Whip Pan | `WHIP PAN` | Fast 90°/s with motion blur, transitions |
| Handheld | `HANDHELD` | Documentary feel; subtle frame jitter |
| Steadicam | `STEADICAM SIDE-TRACKING` / `STEADICAM FOLLOW` | Smooth pursuit |
| Tracking | `TRACKING BACKWARD` / `TRACKING L-TO-R` / `TRACKING 3/4 FRONT` | Side-following action |
| Crane Up | `CRANE UP` | Vertical rise 30 ft / 4s |
| Crane Down | `CRANE DOWN` | Overhead → eye-level |
| 360 Orbit | `ORBIT` / `360 ORBIT` | Circular around subject |
| Spiral | `SPIRAL` | Rise + orbit combined |
| Rack Focus | `RACK FOCUS` | Shift sharp plane (use sparingly) |
| Zoom | `ZOOM IN` / `ZOOM OUT` | Focal length shift (35mm → 85mm equiv) |
| Dutch Angle | `DUTCH ANGLE` | Tilted frame ~20° |
| Push-In Zoom + Dolly | `PUSH-IN ZOOM` | Forward + magnification |
| Parallax Pan | `PARALLAX PAN` | Differential layer movement |
| Slight Arc | `SLIGHT ARC` | Subtle curved path around subject |
| Slight Sway | `SLIGHT SWAY` | Subtle handheld variant |
| Tracking Backwards on Subject | `TRACKING BACKWARDS ON <NAME>` | Camera precedes a walking subject |

## Framing modifiers (combine freely as needed)

### Angle

- `eye level` — neutral, default
- `slight low angle` — gives subject authority / threat
- `low angle` — heroic / dominating
- `slight high angle` — vulnerability / observation
- `high angle` — diminishment
- `dead-on` — confrontational symmetry
- `Dutch / canted` — instability (combine sparingly with movement)

### Composition

- `three-quarter view of <name>` — most flattering portrait angle
- `profile view, <name> Frame-Right, <name2> Frame-Left` — two-shot static
- `OTS from behind <name>'s <side> shoulder` — over-the-shoulder, classic
  reverse-shot setup
- `two-shot compressing the gap` — usually with `TCU` + telephoto, makes
  characters look closer than they are
- `low angle through foreground <object>` — depth via foreground occlusion
  (dried stalks, neon sign, glass)
- `<name> frame-left, <name2> frame-right` — explicit horizontal placement

### Specialty / location

- `INT. PASSENGER SEAT LOOKING AT <name>` — inside-vehicle setup
- `POV <name> THROUGH <element>` — point-of-view shot
- `MS ON <name>, EXT. PASSENGER SIDE` — exterior of vehicle
- `WS perpendicular to their path` — 90° to subject motion (classic
  "walking past camera" composition)
- `LOW ANGLE STATIC` — ground-level tripod
- `FROM BEHIND` — reverse angle on subject from rear

## Lens choices

| Phrase | Effect | Use |
|---|---|---|
| `24mm ultrawide` | Strong perspective distortion | Establishing, action |
| `35mm standard` | Natural perspective | Dialogue, default |
| `50mm portrait` | Slight compression, flattering | Portrait close-ups |
| `85mm closeup` | Compressed, shallow DOF | Intimate CUs |
| `200mm telephoto` | Heavy compression | "Compressing the gap" two-shots |

Embed the lens in the [CAM] line after movement:

```
[CAM] TCU, 85mm telephoto two-shot compressing the gap
[CAM] WS, HANDHELD, 24mm low angle through foreground dried stalks
```

## Reading the canonical scripts

The reference scripts in `example-v1-field-scene.md` and
`example-v2-gas-station-scene.md` use this exact vocabulary. When unsure
how to phrase a shot, search those files for the closest existing example
and adapt.

## Things this skill deliberately does NOT specify

- **Frame rate** — Seedance handles this; don't fight it.
- **Color grading** — pass as a global style anchor at the bottom of the
  flattened prompt, not in `[CAM]`.
- **VFX** — out of scope; the DSL is for live-action coverage simulation.
