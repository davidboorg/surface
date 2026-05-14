'use client';

import { useState, useEffect, useRef } from 'react';
import { ideas, themes, employees } from '@/data/demo';

interface Node {
  id: string;
  type: 'idea' | 'theme' | 'employee';
  label: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  data: typeof ideas[0] | typeof themes[0] | typeof employees[0];
}

interface Edge {
  source: string;
  target: string;
  type: 'theme' | 'related' | 'contributor';
}

const THEME_COLORS: Record<string, string> = {
  'Onboarding Friction': '#E8B341',
  'Internal Communication': '#7C9EB2',
  'Pricing Complexity': '#A8D5BA',
  'Mobile Experience': '#D4A5A5',
  'AI Integration': '#B8A5D4',
};

export default function GraphPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [viewMode, setViewMode] = useState<'themes' | 'contributors'>('themes');

  // Initialize graph data
  useEffect(() => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    // Create theme nodes in a circle
    const centerX = 400;
    const centerY = 300;
    const themeRadius = 200;

    themes.forEach((theme, i) => {
      const angle = (i / themes.length) * Math.PI * 2 - Math.PI / 2;
      newNodes.push({
        id: theme.id,
        type: 'theme',
        label: theme.name,
        x: centerX + Math.cos(angle) * themeRadius,
        y: centerY + Math.sin(angle) * themeRadius,
        radius: 30 + theme.ideaCount * 2,
        color: THEME_COLORS[theme.name] || '#ccc',
        data: theme,
      });
    });

    // Create idea nodes around their themes
    ideas.forEach((idea, i) => {
      const primaryTheme = themes.find((t) => t.name === idea.themes[0]);
      const themeNode = newNodes.find((n) => n.id === primaryTheme?.id);

      if (themeNode) {
        // Position around theme with some randomness
        const angle = Math.random() * Math.PI * 2;
        const distance = 60 + Math.random() * 40;

        newNodes.push({
          id: idea.id,
          type: 'idea',
          label: idea.summary.slice(0, 30) + '...',
          x: themeNode.x + Math.cos(angle) * distance,
          y: themeNode.y + Math.sin(angle) * distance,
          radius: 8 + (idea.reactions.helpful / 4),
          color: themeNode.color,
          data: idea,
        });

        // Edge to primary theme
        newEdges.push({
          source: idea.id,
          target: primaryTheme!.id,
          type: 'theme',
        });

        // Edges to related ideas
        idea.relatedIdeas?.forEach((relatedId) => {
          newEdges.push({
            source: idea.id,
            target: relatedId,
            type: 'related',
          });
        });
      }
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, []);

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Clear
    ctx.fillStyle = '#FEFCF6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw edges
    edges.forEach((edge) => {
      const source = nodes.find((n) => n.id === edge.source);
      const target = nodes.find((n) => n.id === edge.target);

      if (source && target) {
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.strokeStyle = edge.type === 'related' ? '#E8B341' : '#ddd';
        ctx.lineWidth = edge.type === 'related' ? 2 : 1;
        ctx.globalAlpha = edge.type === 'related' ? 0.6 : 0.3;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    });

    // Draw nodes
    nodes.forEach((node) => {
      const isHovered = hoveredNode?.id === node.id;
      const isSelected = selectedNode?.id === node.id;

      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius + (isHovered ? 3 : 0), 0, Math.PI * 2);
      ctx.fillStyle = node.color;
      ctx.globalAlpha = node.type === 'theme' ? 1 : 0.8;
      ctx.fill();
      ctx.globalAlpha = 1;

      if (isSelected) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.stroke();
      } else if (isHovered) {
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Labels for theme nodes
      if (node.type === 'theme') {
        ctx.fillStyle = '#333';
        ctx.font = '12px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y + node.radius + 16);
      }
    });
  }, [nodes, edges, hoveredNode, selectedNode]);

  // Handle mouse events
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if hovering over a node
    const hovered = nodes.find((node) => {
      const dx = node.x - x;
      const dy = node.y - y;
      return Math.sqrt(dx * dx + dy * dy) < node.radius;
    });

    setHoveredNode(hovered || null);
    canvas.style.cursor = hovered ? 'pointer' : 'default';
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clicked = nodes.find((node) => {
      const dx = node.x - x;
      const dy = node.y - y;
      return Math.sqrt(dx * dx + dy * dy) < node.radius;
    });

    setSelectedNode(clicked || null);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-[var(--color-black)] mb-2">Idea Graph</h1>
        <p className="text-[var(--color-gray-600)]">
          Visualize how ideas connect across themes and contributors
        </p>
      </div>

      {/* View Toggle */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex items-center gap-1 p-1 bg-[var(--color-gray-100)] rounded-lg">
          <button
            onClick={() => setViewMode('themes')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'themes'
                ? 'bg-white text-[var(--color-black)] shadow-sm'
                : 'text-[var(--color-gray-600)]'
            }`}
          >
            By Theme
          </button>
          <button
            onClick={() => setViewMode('contributors')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'contributors'
                ? 'bg-white text-[var(--color-black)] shadow-sm'
                : 'text-[var(--color-gray-600)]'
            }`}
          >
            By Contributor
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 ml-auto text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[var(--color-accent)]" />
            <span className="text-[var(--color-gray-600)]">Theme</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[var(--color-gray-400)]" />
            <span className="text-[var(--color-gray-600)]">Idea</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-[var(--color-accent)]" />
            <span className="text-[var(--color-gray-600)]">Related</span>
          </div>
        </div>
      </div>

      {/* Graph Container */}
      <div className="flex gap-6">
        {/* Canvas */}
        <div className="flex-1 bg-white rounded-2xl border border-[var(--color-gray-200)] overflow-hidden">
          <canvas
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onClick={handleClick}
            className="w-full"
            style={{ aspectRatio: '4/3' }}
          />
        </div>

        {/* Details Panel */}
        <div className="w-80 space-y-4">
          {selectedNode ? (
            <div className="p-6 bg-white rounded-2xl border border-[var(--color-gray-200)]">
              {selectedNode.type === 'theme' && (
                <>
                  <div
                    className="w-10 h-10 rounded-xl mb-4"
                    style={{ backgroundColor: selectedNode.color }}
                  />
                  <h3 className="text-lg font-semibold text-[var(--color-black)] mb-2">
                    {(selectedNode.data as typeof themes[0]).name}
                  </h3>
                  <p className="text-[var(--color-gray-600)] mb-4">
                    {(selectedNode.data as typeof themes[0]).description}
                  </p>
                  <div className="text-sm text-[var(--color-gray-500)]">
                    {(selectedNode.data as typeof themes[0]).ideaCount} ideas ·{' '}
                    {(selectedNode.data as typeof themes[0]).trend} trend
                  </div>
                </>
              )}

              {selectedNode.type === 'idea' && (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-gray-200)] flex items-center justify-center text-sm font-medium text-[var(--color-gray-600)]">
                      {(selectedNode.data as typeof ideas[0]).contributor.avatar}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--color-black)]">
                        {(selectedNode.data as typeof ideas[0]).contributor.name}
                      </p>
                      <p className="text-xs text-[var(--color-gray-500)]">
                        {(selectedNode.data as typeof ideas[0]).contributor.role}
                      </p>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--color-black)] mb-2">
                    {(selectedNode.data as typeof ideas[0]).summary}
                  </h3>
                  <p className="text-[var(--color-gray-600)] text-sm mb-4">
                    {(selectedNode.data as typeof ideas[0]).content}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(selectedNode.data as typeof ideas[0]).themes.map((theme) => (
                      <span
                        key={theme}
                        className="px-2 py-1 text-xs rounded-full"
                        style={{ backgroundColor: THEME_COLORS[theme] + '30', color: '#333' }}
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="p-6 bg-white rounded-2xl border border-[var(--color-gray-200)] text-center">
              <p className="text-[var(--color-gray-500)]">
                Click on a node to see details
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="p-6 bg-white rounded-2xl border border-[var(--color-gray-200)]">
            <h3 className="font-semibold text-[var(--color-black)] mb-4">Graph Stats</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-gray-600)]">Total Nodes</span>
                <span className="font-medium text-[var(--color-black)]">{nodes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-gray-600)]">Connections</span>
                <span className="font-medium text-[var(--color-black)]">{edges.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-gray-600)]">Themes</span>
                <span className="font-medium text-[var(--color-black)]">{themes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-gray-600)]">Ideas</span>
                <span className="font-medium text-[var(--color-black)]">{ideas.length}</span>
              </div>
            </div>
          </div>

          {/* Related Ideas */}
          {selectedNode?.type === 'idea' && (selectedNode.data as typeof ideas[0]).relatedIdeas?.length ? (
            <div className="p-6 bg-white rounded-2xl border border-[var(--color-gray-200)]">
              <h3 className="font-semibold text-[var(--color-black)] mb-4">Related Ideas</h3>
              <div className="space-y-3">
                {(selectedNode.data as typeof ideas[0]).relatedIdeas?.map((relatedId) => {
                  const related = ideas.find((i) => i.id === relatedId);
                  if (!related) return null;
                  return (
                    <div
                      key={relatedId}
                      className="p-3 bg-[var(--color-gray-50)] rounded-lg cursor-pointer hover:bg-[var(--color-gray-100)] transition-colors"
                      onClick={() => {
                        const relatedNode = nodes.find((n) => n.id === relatedId);
                        if (relatedNode) setSelectedNode(relatedNode);
                      }}
                    >
                      <p className="text-sm font-medium text-[var(--color-black)]">
                        {related.summary}
                      </p>
                      <p className="text-xs text-[var(--color-gray-500)] mt-1">
                        by {related.contributor.name}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
