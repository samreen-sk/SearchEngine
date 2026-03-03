import React from "react";
import { cn } from "../../lib/cn";

export default function Card({ className, children }) {
  return <div className={cn("card p-5", className)}>{children}</div>;
}
