import { Zapp, ZupassAPI, connect } from "@pcd/zupass-client";
import React from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";

export enum EmbeddedZupassState {
  CONNECTING,
  CONNECTED
}

export const EmbeddedZupassContext = createContext<EmbeddedZupass>({
  state: EmbeddedZupassState.CONNECTING,
  ref: React.createRef<HTMLDivElement>()
});

type EmbeddedZupass =
  | {
      state: EmbeddedZupassState.CONNECTING;
      ref: React.RefObject<HTMLDivElement>;
    }
  | {
      state: EmbeddedZupassState.CONNECTED;
      z: ZupassAPI;
      ref: React.RefObject<HTMLDivElement>;
    };

export function EmbeddedZupassProvider({
  zapp,
  zupassUrl,
  children
}: {
  zapp: Zapp;
  zupassUrl: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const [value, setValue] = useState<EmbeddedZupass>({
    state: EmbeddedZupassState.CONNECTING,
    ref
  });

  useEffect(() => {
    if (ref.current) {
      connect(zapp, ref.current, zupassUrl).then((zupass) => {
        setValue({
          state: EmbeddedZupassState.CONNECTED,
          z: {
            ...zupass,
            // @ts-ignore TODO: Fix type mismatch for _version property
            _version: 'unknown'
          },
          ref
        });
      });
    }
  }, []);

  return (
    <EmbeddedZupassContext.Provider value={value}>
      <div ref={ref}></div>
      {children}
    </EmbeddedZupassContext.Provider>
  );
}

type UseEmbeddedZupass =
  | {
      connected: true;
      z: ZupassAPI;
    }
  | {
      connected: false;
      z: {};
    };

export function useEmbeddedZupass(): UseEmbeddedZupass {
  const context = useContext(EmbeddedZupassContext);
  return context.state === EmbeddedZupassState.CONNECTED
    ? {
        connected: true,
        z: context.z
      }
    : {
        connected: false,
        z: {}
      };
}
