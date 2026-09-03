"use client";

interface Props {
  /** rim spotlight color */
  rim?: string;
  rimIntensity?: number;
  keyColor?: string;
  keyIntensity?: number;
}

/** Ambient + warm key directional + cyan rim spot + fill. */
export function SceneLights({ rim = "#4ad9ff", rimIntensity = 6, keyColor = "#fff4e6", keyIntensity = 3 }: Props) {
  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[3, 4, 3]} intensity={keyIntensity} color={keyColor} castShadow />
      <spotLight position={[-4, 3, -4]} angle={0.5} penumbra={0.8} intensity={rimIntensity} color={rim} />
      <directionalLight position={[-2, 1, 4]} intensity={0.6} color="#cfd6e0" />
    </>
  );
}
