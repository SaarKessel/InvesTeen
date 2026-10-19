"use client";
import { useEffect, useState } from "react";
import { StretchSwitch } from "@/components/easyui/StretchSwitch";
import { motionPrefReduced, setMotionPref } from "@/components/MotionPrefs";

export function MotionSwitch() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => { setReduced(motionPrefReduced()); }, []);
  return (
    <StretchSwitch
      checked={reduced}
      onChange={(v) => { setReduced(v); setMotionPref(v); }}
      label="צמצום אנימציות"
      description="מכבה תנועות ואפקטים. מתאים לרגישות לתנועה ולשיפור נגישות."
    />
  );
}
