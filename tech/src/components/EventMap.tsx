import { Html } from "@react-three/drei";
import { useRef, type CSSProperties } from "react";
import * as THREE from "three";
import type { EventTrack } from "../data";
import RealmScene, { type RealmControls } from "./RealmScene";

type EventMapProps = {
  events: EventTrack[];
  activeId: string;
  onSelect: (id: string) => void;
};

const locations: Array<[number, number, number]> = [
  [-7, 0.8, -2.4],
  [-4.1, 1.45, 1],
  [-1.4, 0.8, -3.5],
  [1.6, 1.4, 1],
  [4.5, 0.8, 1.3],
  [7.3, 0.8, -2],
];

function MapSignals({
  events,
  activeId,
  onSelect,
}: EventMapProps) {
  return (
    <>
      {events.map((event, index) => (
        <SignalMarker
          key={event.id}
          event={event}
          position={locations[index]}
          active={event.id === activeId}
          onSelect={() => onSelect(event.id)}
        />
      ))}
    </>
  );
}

function SignalMarker({
  event,
  position,
  active,
  onSelect,
}: {
  event: EventTrack;
  position: [number, number, number];
  active: boolean;
  onSelect: () => void;
}) {
  const marker = useRef<THREE.Group>(null);
  return (
    <group ref={marker} position={position}>
      <mesh onClick={onSelect} scale={active ? 0.19 : 0.14}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial color={event.accent} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <ringGeometry args={[0.22, 0.24, 32]} />
        <meshBasicMaterial color={event.accent} transparent opacity={0.68} side={THREE.DoubleSide} />
      </mesh>
      <Html
        center
        distanceFactor={8}
        position={[0, 0.47, 0]}
        style={{ pointerEvents: "auto" }}
      >
        <button
          className={`map-marker${active ? " map-marker-active" : ""}`}
          type="button"
          aria-pressed={active}
          aria-label={`Explore ${event.name}, ${event.district}`}
          onClick={onSelect}
          style={{ "--marker-accent": event.accent } as CSSProperties}
        >
          <span className="map-marker-ping" />
          <span className="map-marker-name">{event.name}</span>
          <span className="map-marker-district">{event.district}</span>
        </button>
      </Html>
    </group>
  );
}

export default function EventMap({ events, activeId, onSelect }: EventMapProps) {
  const controls = useRef<RealmControls>({ entry: 0 });
  return (
    <div className="event-map">
      <RealmScene controls={controls} map>
        <MapSignals events={events} activeId={activeId} onSelect={onSelect} />
      </RealmScene>
      <div className="map-coordinate mono">ASTERION / 03<br />ALL SIX DISTRICTS ONLINE</div>
      <span className="map-scanline" aria-hidden="true" />
    </div>
  );
}
