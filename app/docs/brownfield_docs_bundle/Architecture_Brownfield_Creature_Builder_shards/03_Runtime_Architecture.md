\## 3) Runtime Architecture



```

\[ p5.js Sketch / Test HTML ]

&nbsp;         |

&nbsp;         v

&nbsp;\[ ModularCreatureBuilder ]  <-- orchestrator (builds, updates, draws)

&nbsp;   |         |         |

&nbsp;   |         |         |

&nbsp;   v         v         v

\[Anatomy]  \[Constraints] \[Locomotion]

&nbsp; data        IK rules      patterns/gaits

&nbsp;   |            |              |

&nbsp;   |            v              v

&nbsp;   |        \[FIK.js]      \[Locomotion System]

&nbsp;   v

\[Shape/Profiles + Styling]

&nbsp;         |

&nbsp;         v

&nbsp;     \[Canvas Render]

```



\### Key runtime flows



1\. \*\*Build\*\*: The builder processes an anatomical config → spawns chains/bones → applies templates and constraints → assigns a locomotion controller.

2\. \*\*Update loop\*\*: Each frame, locomotion computes targets (e.g., foot placements, spine flex) → constraints/IK solve → positions propagate through bones and chains → debug overlays optional.

3\. \*\*Draw\*\*: Rendering respects the current mode (e.g., skeleton vs current/skin) with optional themed borders/fillers/segments.



---
