// FIK adapter implementing the IKAdapter interface
// Binds the global FIK constructors to an interface consumed by domain code

(function initFIKAdapterFactory(global){
  function createIKAdapter(FIK) {
    if (!FIK) throw new Error('FIK not available for IK adapter');
    return {
      V2: FIK.V2,
      Chain2D: FIK.Chain2D,
      Bone2D: FIK.Bone2D,
    };
  }

  global.createIKAdapter = createIKAdapter;
})(typeof window !== 'undefined' ? window : globalThis);

