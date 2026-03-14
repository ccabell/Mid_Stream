import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { opportunitiesApi } from 'apiServices';
import type { Opportunity } from 'apiServices';
import { runDetailPath } from 'constants/routes';

const STAGES: Opportunity['stage'][] = ['New', 'In progress', 'Won', 'Lost'];

function DraggableCard({ opportunity }: { opportunity: Opportunity }) {
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: opportunity.id,
    data: { opportunity },
  });

  return (
    <Card
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      sx={{
        mb: 1,
        cursor: 'grab',
        opacity: isDragging ? 0.5 : 1,
        '&:active': { cursor: 'grabbing' },
      }}
    >
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Typography variant="subtitle2">
          {opportunity.title ?? opportunity.product_or_service ?? `Opportunity ${(opportunity.item_index ?? 0) + 1}`}
        </Typography>
        {opportunity.blurb && (
          <Typography variant="caption" color="text.secondary" display="block" noWrap>
            {opportunity.blurb}
          </Typography>
        )}
        {opportunity.value != null && opportunity.value > 0 && (
          <Typography variant="caption" color="text.secondary" display="block">
            ${opportunity.value.toLocaleString()}
          </Typography>
        )}
        <Typography
          variant="caption"
          sx={{ color: 'primary.main', cursor: 'pointer', mt: 0.5, display: 'block' }}
          onClick={(e) => {
            e.stopPropagation();
            navigate(runDetailPath(opportunity.run_id));
          }}
        >
          Run {opportunity.run_id.slice(0, 8)}...
        </Typography>
      </CardContent>
    </Card>
  );
}

function DroppableColumn({
  stage,
  opportunities,
}: {
  stage: Opportunity['stage'];
  opportunities: Opportunity[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const totalValue = opportunities.reduce((sum, o) => sum + (o.value ?? 0), 0);

  return (
    <Box
      ref={setNodeRef}
      sx={{
        minWidth: 280,
        flex: 1,
        p: 1.5,
        borderRadius: 1,
        backgroundColor: isOver ? 'action.hover' : 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'background-color 0.15s',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {stage} ({opportunities.length})
        </Typography>
        {totalValue > 0 && (
          <Typography variant="caption" color="text.secondary">
            ${totalValue.toLocaleString()}
          </Typography>
        )}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {opportunities.map((opp) => (
          <DraggableCard key={opp.id} opportunity={opp} />
        ))}
      </Box>
    </Box>
  );
}

export function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    opportunitiesApi
      .list()
      .then((data) => setOpportunities(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const handleMove = (id: string, stage: Opportunity['stage']) => {
    opportunitiesApi.updateStage(id, stage).then(() => {
      setOpportunities((prev) => prev.map((o) => (o.id === id ? { ...o, stage } : o)));
    });
  };

  const handleDragStart = (event: DragStartEvent) => setActiveId(String(event.active.id));
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const overId = event.over?.id;
    const dragId = event.active.id;
    if (!overId || typeof dragId !== 'string') return;
    const newStage = STAGES.includes(overId as Opportunity['stage']) ? (overId as Opportunity['stage']) : null;
    if (newStage) handleMove(dragId, newStage);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const byStage = STAGES.reduce<Record<string, Opportunity[]>>((acc, s) => {
    acc[s] = opportunities.filter((o) => o.stage === s);
    return acc;
  }, {});

  const activeOpp = activeId ? opportunities.find((o) => o.id === activeId) : null;

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <Box>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Opportunities
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
          {STAGES.map((stage) => (
            <DroppableColumn key={stage} stage={stage} opportunities={byStage[stage] ?? []} />
          ))}
        </Box>
      </Box>
      <DragOverlay>
        {activeOpp ? (
          <Card sx={{ minWidth: 260, boxShadow: 4 }}>
            <CardContent sx={{ py: 1.5 }}>
              <Typography variant="subtitle2">
                {activeOpp.title ?? activeOpp.product_or_service ?? `Opportunity`}
              </Typography>
            </CardContent>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
