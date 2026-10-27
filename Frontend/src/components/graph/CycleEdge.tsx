import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  Position,
  type Edge,
  type EdgeProps,
} from '@xyflow/react'

type CycleEdgeData = {
  label: string
} & Record<string, unknown>

type CycleFlowEdge = Edge<CycleEdgeData, 'cycle'>

export function CycleEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition = Position.Bottom,
  targetPosition = Position.Bottom,
  data,
  style,
  markerEnd,
}: EdgeProps<CycleFlowEdge>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.42,
  })

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={style} markerEnd={markerEnd} interactionWidth={18} />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan pointer-events-none absolute rounded border border-cycle/20 bg-cycle-soft px-1 py-0.5 font-mono text-[7px] font-semibold uppercase tracking-[0.08em] text-cycle"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }}
        >
          {data?.label ?? 'cycle'}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
