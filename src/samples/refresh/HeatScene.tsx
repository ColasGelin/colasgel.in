"use client";

import { Canvas, useThree, type ThreeEvent } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Color, Object3D, type InstancedMesh } from "three";
import {
  CELL_DEPTH,
  CELL_WIDTH,
  adjustedTemp,
  cellPosition,
  type Cell,
  type Zone,
} from "./cooling";

const HEIGHT_SCALE = 18;

// Same blue-to-red ramp as the source project.
function hue(normalized: number): number {
  const stops = [240, 180, 120, 60, 20, 0];
  const position = Math.min(normalized, 0.9999) / 0.2;
  const index = Math.floor(position);
  return stops[index] + (stops[index + 1] - stops[index]) * (position - index);
}

function Cells({ cells, zones, onPlace }: SceneProps) {
  const mesh = useRef<InstancedMesh>(null);
  const invalidate = useThree((state) => state.invalidate);
  const [min, max] = useMemo(() => {
    const temps = cells.map((cell) => cell.temp);
    return [Math.min(...temps), Math.max(...temps)];
  }, [cells]);

  useLayoutEffect(() => {
    const dummy = new Object3D();
    const color = new Color();
    const range = Math.max(max - min, 1);
    cells.forEach((cell, index) => {
      const temp = adjustedTemp(cell, zones, min);
      const normalized = (temp - min) / range;
      const height = 0.5 + normalized * HEIGHT_SCALE;
      const { x, z } = cellPosition(cell);
      dummy.position.set(x, height / 2, z);
      dummy.scale.set(CELL_WIDTH, height, CELL_DEPTH);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(index, dummy.matrix);
      color.setHSL(hue(normalized) / 360, 1, 0.5);
      mesh.current!.setColorAt(index, color);
    });
    mesh.current!.instanceMatrix.needsUpdate = true;
    mesh.current!.instanceColor!.needsUpdate = true;
    invalidate();
  }, [cells, zones, min, max, invalidate]);

  return (
    <instancedMesh
      key={cells.length}
      ref={mesh}
      args={[undefined, undefined, cells.length]}
      onClick={(event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
        onPlace({ x: event.point.x, z: event.point.z });
      }}
    >
      <boxGeometry />
      <meshBasicMaterial />
    </instancedMesh>
  );
}

type SceneProps = {
  cells: Cell[];
  zones: Zone[];
  onPlace: (zone: Zone) => void;
};

export default function HeatScene({ cells, zones, onPlace }: SceneProps) {
  const [ready, setReady] = useState(false);

  return (
    <Canvas
      frameloop="demand"
      onCreated={() => setReady(true)}
      camera={{ position: [0, 235, 205], fov: 45 }}
      className={`aspect-[4/3] w-full rounded border border-line bg-surface transition-opacity duration-300 motion-reduce:transition-none ${
        ready ? "opacity-100" : "opacity-0"
      }`}
    >
      <Cells cells={cells} zones={zones} onPlace={onPlace} />
      {zones.map((zone, index) => (
        <mesh key={index} position={[zone.x, 16, zone.z]}>
          <cylinderGeometry args={[4, 4, 32, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}
    </Canvas>
  );
}
