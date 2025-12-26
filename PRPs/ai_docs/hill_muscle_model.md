# Hill Muscle Model Reference

## Overview

The Hill muscle model is the gold standard for modeling muscle mechanics in real-time graphics. It describes the relationship between muscle force, length, and velocity.

## Core Equations

### Force Production
```
F = F_max × (F_l × F_v × a + F_p)
```

Where:
- `F_max` = Maximum isometric force
- `F_l` = Force-length relationship
- `F_v` = Force-velocity relationship
- `a` = Activation level (0-1)
- `F_p` = Passive force

### Force-Length Relationship
```
F_l = exp(-((l/l_opt - 1)^2) / (2 * σ_l^2))
```

Where:
- `l` = Current muscle length
- `l_opt` = Optimal length (max force)
- `σ_l` = Shape parameter (typically 0.5-0.6)

### Force-Velocity Relationship
```
Concentric (shortening): F_v = (V_max - v) / (V_max + v / k_short)
Eccentric (lengthening): F_v = (V_max + k_long × v) / (V_max - v)
```

Where:
- `v` = Muscle velocity (positive for lengthening)
- `V_max` = Maximum shortening velocity
- `k_short`, `k_long` = Shape constants

### Passive Force
```
F_p = exp(exp_rate × (l/l_0 - 1)) - 1
```

Where:
- `l_0` = Rest length
- `exp_rate` = Exponential rate (typically 5-15)

## Implementation for Real-Time Graphics

### Simplified Version (GPU-friendly)
```glsl
float hillMuscleForce(float length, float restLength, float velocity, float activation) {
    // Normalized metrics
    float lNorm = length / restLength;
    float vNorm = velocity / restLength;

    // Force-length (parabolic approximation)
    float forceLength = 1.0 - 4.0 * pow(lNorm - 1.0, 2.0);
    forceLength = clamp(forceLength, 0.0, 1.0);

    // Force-velocity (linear approximation)
    float forceVelocity = 1.0 - abs(vNorm) * 0.1;

    // Combine
    return activation * forceLength * forceVelocity;
}
```

### Parameters for Horse Muscles
| Muscle Type | V_max (l/s) | k_short | k_long | σ_l |
|-------------|-------------|---------|---------|------|
| Biceps | 8.0 | 0.25 | 1.5 | 0.5 |
| Gastrocnemius | 12.0 | 0.3 | 2.0 | 0.4 |
| Longissimus | 6.0 | 0.2 | 1.2 | 0.6 |

## GPU Optimization Tips

1. **Precompute constants**: Most parameters are fixed per muscle
2. **Use texture lookups**: Store parameters in textures for many muscles
3. **Approximate**: Use simpler approximations for distant muscles
4. **Batch calculations**: Process multiple muscles in parallel

## References

- Hill, A.V. (1938). "The heat of shortening and the dynamic constants of muscle"
- Thelen, D.G. (2003). "Adjustment of muscle mechanics model parameters"
- Millard, M. et al. (2013). "Computing the passive moment-curvature relationship of biomechanics of the human knee"