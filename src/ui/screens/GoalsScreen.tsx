import React from "react";
import type { Goal, Objective } from "../../types.ts";
import { ProgressBar } from "../components/ProgressBar.tsx";

interface GoalsScreenProps {
  objectives: Objective[];
  goals: Goal[];
}

export function GoalsScreen({ objectives, goals }: GoalsScreenProps) {
  return (
    <box
      flexDirection="column"
      width="100%"
      height="100%"
      border={true}
      borderStyle="single"
      borderColor="#313244"
      backgroundColor="#181825"
    >
      <text fg="#cba6f7"><b>  Objectives & Goals</b></text>
      <text> </text>

      <scrollbox width="100%" flexGrow={1}>
        {objectives.length === 0 && goals.length === 0 && (
          <text fg="#45475a">  No objectives yet. Type /goal add to create one!</text>
        )}

        {objectives.map((obj) => {
          const related = goals.filter((g) => g.objective_id === obj.id);
          return (
            <box key={obj.id} flexDirection="column">
              <text fg="#89b4fa"><b>{`  * ${obj.title}`}</b></text>
              {obj.deadline && <text fg="#6c7086">{`    Deadline: ${obj.deadline}`}</text>}
              {related.map((g) => (
                <box key={g.id} flexDirection="column">
                  <text fg="#cdd6f4">{`    -> ${g.title}`}</text>
                  <ProgressBar value={g.progress} width={15} />
                </box>
              ))}
              <text> </text>
            </box>
          );
        })}

        {goals.filter((g) => !g.objective_id).map((g) => (
          <box key={g.id} flexDirection="column">
            <text fg="#cdd6f4"><b>{`  * ${g.title}`}</b></text>
            <ProgressBar value={g.progress} width={15} />
            <text> </text>
          </box>
        ))}
      </scrollbox>
    </box>
  );
}
