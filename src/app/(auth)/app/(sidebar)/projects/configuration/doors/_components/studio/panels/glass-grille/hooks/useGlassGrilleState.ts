/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAccessories, getBrassPatterns, createBrassPattern, deleteBrassPattern, getBrassOrnaments } from '@/actions';
import { SceneCellNode, GlassGrilleConfig, GlassGrilleMotif } from '../../../studio-types';
import toast from 'react-hot-toast';
import { MOTIF_DEFS } from '../../grille-motif-svgs';
import { DragTarget, SavedTemplateItem, EditingDim } from '../types';

interface UseGlassGrilleStateProps {
  isOpen: boolean;
  onClose: () => void;
  cell: SceneCellNode | null;
  totalSashesCount?: number;
  onApply: (config: GlassGrilleConfig, applyToAllSashes: boolean) => void;
}

export function useGlassGrilleState({
  isOpen,
  onClose,
  cell,
  totalSashesCount = 1,
  onApply,
}: UseGlassGrilleStateProps) {
  const { data: accessoriesData } = useQuery({
    queryKey: ['accessories'],
    queryFn: () => getAccessories({ limit: 500 }),
    staleTime: 5 * 60 * 1000,
    enabled: isOpen,
  });
  const accessories = useMemo(() => accessoriesData?.items || [], [accessoriesData]);

  const glassW = cell?.grilleConfig?.glassW || cell?.w || 540;
  const glassH = cell?.grilleConfig?.glassH || cell?.h || 1333;
  const installedW = cell?.grilleConfig?.installedW || glassW;
  const installedH = cell?.grilleConfig?.installedH || glassH;

  const [hasGrid, setHasGrid] = useState(true);
  const [hasBorder, setHasBorder] = useState(true);
  const [hasCorner, setHasCorner] = useState(true);
  const [barWidth, setBarWidth] = useState(6);
  const [barColor, setBarColor] = useState('#D4AF37');
  const [applyToAll, setApplyToAll] = useState(false);

  const [cols, setCols] = useState(3);
  const [rows, setRows] = useState(3);
  const [colPositions, setColPositions] = useState<number[]>([184, 356]);
  const [rowPositions, setRowPositions] = useState<number[]>([448, 885]);
  const [isSymmetric, setIsSymmetric] = useState(true);
  const [borderOffset, setBorderOffset] = useState(95);
  const [cornerSize, setCornerSize] = useState(180);
  const [motifs, setMotifs] = useState<GlassGrilleMotif[]>([]);
  const [selectedMotifId, setSelectedMotifId] = useState<string | null>(null);
  const [activeMotifTool, setActiveMotifTool] = useState<string>('flower_classic');

  const [unitPricePerM, setUnitPricePerM] = useState<number>(85000);
  const [motifUnitPrice, setMotifUnitPrice] = useState<number>(150000);

  const [activeRightTab, setActiveRightTab] = useState<'nan' | 'templates'>('nan');
  const [templateName, setTemplateName] = useState('');
  const [zoom, setZoom] = useState(1);
  const [dragTarget, setDragTarget] = useState<DragTarget | null>(null);
  const [dragOverCell, setDragOverCell] = useState<{ c: number; r: number } | null>(null);

  const [editingDim, setEditingDim] = useState<EditingDim | null>(null);
  const [dimInputValue, setDimInputValue] = useState<string>('');

  const svgRef = useRef<SVGSVGElement | null>(null);
  const selectedMotifCardRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();

  const { data: dbPatternsData, isLoading: isLoadingPatterns } = useQuery({
    queryKey: ['brass-patterns'],
    queryFn: () => getBrassPatterns({ limit: 100 }),
    staleTime: 60 * 1000,
    enabled: isOpen,
  });

  const { data: dbOrnamentsData } = useQuery({
    queryKey: ['brass-ornaments'],
    queryFn: () => getBrassOrnaments({ limit: 100, isActive: true }),
    staleTime: 60 * 1000,
    enabled: isOpen,
  });

  const getMotifDefaultPrice = useCallback(
    (motifType: string, fallbackPrice = 150000): number => {
      if (dbOrnamentsData?.items && dbOrnamentsData.items.length > 0) {
        const found = dbOrnamentsData.items.find((item) => {
          if (motifType === 'flower_classic' || motifType === 'chu_van') {
            return item.code === 'chu_van' || item.code === 'flower_classic';
          }
          if (motifType === 'rhombus' || motifType === 'kim_cuong_vuong') {
            return item.code === 'kim_cuong_vuong' || item.code === 'rhombus';
          }
          if (motifType === 'lotus' || motifType === 'tram_kim_cuong') {
            return item.code === 'tram_kim_cuong' || item.code === 'lotus';
          }
          return item.code === motifType;
        });
        if (found && typeof found.price === 'number') {
          return found.price;
        }
      }
      if (motifType === 'rhombus' || motifType === 'kim_cuong_vuong') return 95000;
      if (motifType === 'lotus' || motifType === 'tram_kim_cuong') return 380000;
      return fallbackPrice;
    },
    [dbOrnamentsData]
  );

  useEffect(() => {
    if (selectedMotifId && selectedMotifCardRef.current) {
      selectedMotifCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedMotifId]);

  const patterns: SavedTemplateItem[] = useMemo(() => {
    if (dbPatternsData?.items && dbPatternsData.items.length > 0) {
      return dbPatternsData.items.map((item) => ({
        id: String(item.id),
        name: item.name,
        description: item.description || '',
        isDefault: item.isSystem,
        config: item.patternData || {},
      }));
    }
    return [];
  }, [dbPatternsData]);

  const createPatternMutation = useMutation({
    mutationFn: (data: { name: string; description?: string; patternData: Partial<GlassGrilleConfig> }) =>
      createBrassPattern(data),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['brass-patterns'] });
      setTemplateName('');
      toast.success(`Đã lưu mẫu "${created.name}" vào CSDL`);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || 'Không thể lưu mẫu nan vào CSDL');
    },
  });

  const deletePatternMutation = useMutation({
    mutationFn: (id: number) => deleteBrassPattern(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brass-patterns'] });
      toast.success('Đã xóa mẫu khỏi CSDL');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || 'Không thể xóa mẫu nan');
    },
  });

  const generateUniformCols = useCallback((cCount: number, currentW: number) => {
    if (cCount <= 1) return [];
    if (cCount === 3 && Math.abs(currentW - 540) <= 30) {
      return [184, 356];
    }
    const step = currentW / cCount;
    return Array.from({ length: cCount - 1 }, (_, i) => Math.round((i + 1) * step));
  }, []);

  const generateUniformRows = useCallback((rCount: number, currentH: number) => {
    if (rCount <= 1) return [];
    if (rCount === 3 && Math.abs(currentH - 1333) <= 50) {
      return [448, 885];
    }
    const step = currentH / rCount;
    return Array.from({ length: rCount - 1 }, (_, i) => Math.round((i + 1) * step));
  }, []);

  useEffect(() => {
    if (cell && isOpen) {
      const cfg = cell.grilleConfig;
      if (cfg && cfg.enabled) {
        setHasGrid(cfg.hasGrid ?? true);
        setHasBorder(cfg.hasBorder ?? true);
        setHasCorner(cfg.hasCorner ?? true);
        setBarWidth(cfg.barWidth || 6);
        setBarColor(cfg.barColor || '#D4AF37');
        const c = cfg.cols || 1;
        const r = cfg.rows || 1;
        setCols(c);
        setRows(r);
        setBorderOffset(cfg.borderOffset || 95);
        setCornerSize(cfg.cornerSize || 180);
        setIsSymmetric(cfg.isSymmetric ?? true);
        setUnitPricePerM(cfg.unitPricePerM ?? 85000);
        setMotifUnitPrice(cfg.motifUnitPrice ?? 150000);

        const initCols =
          cfg.colPositions && cfg.colPositions.length === c - 1
            ? cfg.colPositions
            : generateUniformCols(c, glassW);
        const initRows =
          cfg.rowPositions && cfg.rowPositions.length === r - 1
            ? cfg.rowPositions
            : generateUniformRows(r, glassH);

        setColPositions(initCols);
        setRowPositions(initRows);

        if (cfg.motifs && cfg.motifs.length > 0) {
          const alignedMotifs = cfg.motifs.map((m) => {
            if (m.gridCol !== undefined && m.gridRow !== undefined && initCols[m.gridCol] && initRows[m.gridRow]) {
              return {
                ...m,
                x: initCols[m.gridCol],
                y: initRows[m.gridRow],
              };
            }
            return m;
          });
          setMotifs(alignedMotifs);
        } else {
          setMotifs([]);
        }
        setApplyToAll(cfg.applyToAllSashes ?? totalSashesCount > 1);
      } else {
        setHasGrid(false);
        setHasBorder(false);
        setHasCorner(false);
        setBarWidth(6);
        setBarColor('#D4AF37');
        setCols(1);
        setRows(1);
        setBorderOffset(95);
        setCornerSize(180);
        setIsSymmetric(true);
        setUnitPricePerM(85000);
        setMotifUnitPrice(150000);

        const defCols = generateUniformCols(1, glassW);
        const defRows = generateUniformRows(1, glassH);
        setColPositions(defCols);
        setRowPositions(defRows);
        setMotifs([]);
        setApplyToAll(totalSashesCount > 1);
      }
      setSelectedMotifId(null);
      setZoom(1);
    }
  }, [cell, isOpen, glassW, glassH, totalSashesCount, generateUniformCols, generateUniformRows, getMotifDefaultPrice]);

  const handleColsChange = (newCols: number) => {
    const val = Math.max(1, Math.min(8, newCols));
    setCols(val);
    const newPositions = generateUniformCols(val, glassW);
    setColPositions(newPositions);
    setMotifs((prev) =>
      prev
        .filter((m) => m.gridCol === undefined || m.gridCol < newPositions.length)
        .map((m) => (m.gridCol !== undefined ? { ...m, x: newPositions[m.gridCol] } : m))
    );
  };

  const handleRowsChange = (newRows: number) => {
    const val = Math.max(1, Math.min(8, newRows));
    setRows(val);
    const newPositions = generateUniformRows(val, glassH);
    setRowPositions(newPositions);
    setMotifs((prev) =>
      prev
        .filter((m) => m.gridRow === undefined || m.gridRow < newPositions.length)
        .map((m) => (m.gridRow !== undefined ? { ...m, y: newPositions[m.gridRow] } : m))
    );
  };

  const colSpans: number[] = useMemo(() => {
    if (colPositions.length > 0) {
      const spans: number[] = [colPositions[0]];
      for (let i = 0; i < colPositions.length - 1; i++) {
        spans.push(colPositions[i + 1] - colPositions[i]);
      }
      spans.push(glassW - colPositions[colPositions.length - 1]);
      return spans;
    }
    return [glassW];
  }, [colPositions, glassW]);

  const rowSpans: number[] = useMemo(() => {
    if (rowPositions.length > 0) {
      const spans: number[] = [rowPositions[0]];
      for (let i = 0; i < rowPositions.length - 1; i++) {
        spans.push(rowPositions[i + 1] - rowPositions[i]);
      }
      spans.push(glassH - rowPositions[rowPositions.length - 1]);
      return spans;
    }
    return [glassH];
  }, [rowPositions, glassH]);

  const handleOpenEditDim = (
    type: 'col-span' | 'row-span' | 'border-offset' | 'corner-size',
    index: number | undefined,
    label: string,
    currentValue: number
  ) => {
    setEditingDim({ type, index, label, currentValue });
    setDimInputValue(String(currentValue));
  };

  const handleSaveEditedDimension = () => {
    if (!editingDim) return;
    const numVal = Math.round(Number(dimInputValue));
    if (isNaN(numVal) || numVal <= 0) {
      toast.error('Vui lòng nhập một kích thước hợp lệ (> 0 mm)');
      return;
    }

    if (editingDim.type === 'border-offset') {
      const maxOffset = Math.round(Math.min(glassW, glassH) / 2 - 20);
      const clamped = Math.max(20, Math.min(maxOffset, numVal));
      setBorderOffset(clamped);
      toast.success(`Đã cập nhật lề viền: ${clamped} mm`);
    } else if (editingDim.type === 'corner-size') {
      const maxCorner = Math.round(Math.min(glassW, glassH) / 2 - 10);
      const clamped = Math.max(borderOffset + 10, Math.min(maxCorner, numVal));
      setCornerSize(clamped);
      toast.success(`Đã cập nhật chiều dài góc: ${clamped} mm`);
    } else if (editingDim.type === 'col-span' && editingDim.index !== undefined) {
      const idx = editingDim.index;
      if (colPositions.length === 1) {
        let newX = idx === 0 ? numVal : glassW - numVal;
        newX = Math.max(40, Math.min(glassW - 40, newX));
        setColPositions([newX]);
        setMotifs((prev) => prev.map((m) => (m.gridCol === 0 ? { ...m, x: newX } : m)));
        toast.success(`Đã cập nhật khoang cột: ${idx === 0 ? newX : glassW - newX} mm`);
      } else {
        const nextPositions = [...colPositions];
        if (idx === 0) {
          const minX = 40;
          const maxX = nextPositions[1] - 30;
          const newX = Math.max(minX, Math.min(maxX, numVal));
          nextPositions[0] = newX;
          if (isSymmetric) {
            const mirrorIdx = nextPositions.length - 1;
            nextPositions[mirrorIdx] = glassW - newX;
          }
        } else if (idx === colSpans.length - 1) {
          const lastIdx = nextPositions.length - 1;
          const newX = glassW - numVal;
          const minX = nextPositions[lastIdx - 1] + 30;
          const maxX = glassW - 40;
          const clampedX = Math.max(minX, Math.min(maxX, newX));
          nextPositions[lastIdx] = clampedX;
          if (isSymmetric) {
            nextPositions[0] = glassW - clampedX;
          }
        } else {
          const prevX = nextPositions[idx - 1];
          const nextXLimit = idx < nextPositions.length - 1 ? nextPositions[idx + 1] - 30 : glassW - 40;
          const newX = Math.max(prevX + 30, Math.min(nextXLimit, prevX + numVal));
          nextPositions[idx] = newX;
          if (isSymmetric) {
            const mirrorIdx = nextPositions.length - 1 - idx;
            if (mirrorIdx !== idx) {
              nextPositions[mirrorIdx] = glassW - newX;
            }
          }
        }

        setColPositions(nextPositions);
        setMotifs((prev) =>
          prev.map((m) => {
            if (m.gridCol !== undefined && nextPositions[m.gridCol] !== undefined) {
              return { ...m, x: nextPositions[m.gridCol] };
            }
            return m;
          })
        );
        toast.success('Đã cập nhật vị trí nan dọc');
      }
    } else if (editingDim.type === 'row-span' && editingDim.index !== undefined) {
      const idx = editingDim.index;
      if (rowPositions.length === 1) {
        let newY = idx === 0 ? numVal : glassH - numVal;
        newY = Math.max(40, Math.min(glassH - 40, newY));
        setRowPositions([newY]);
        setMotifs((prev) => prev.map((m) => (m.gridRow === 0 ? { ...m, y: newY } : m)));
        toast.success(`Đã cập nhật khoang hàng: ${idx === 0 ? newY : glassH - newY} mm`);
      } else {
        const nextPositions = [...rowPositions];
        if (idx === 0) {
          const minY = 40;
          const maxY = nextPositions[1] - 30;
          const newY = Math.max(minY, Math.min(maxY, numVal));
          nextPositions[0] = newY;
          if (isSymmetric) {
            const mirrorIdx = nextPositions.length - 1;
            nextPositions[mirrorIdx] = glassH - newY;
          }
        } else if (idx === rowSpans.length - 1) {
          const lastIdx = nextPositions.length - 1;
          const newY = glassH - numVal;
          const minY = nextPositions[lastIdx - 1] + 30;
          const maxY = glassH - 40;
          const clampedY = Math.max(minY, Math.min(maxY, newY));
          nextPositions[lastIdx] = clampedY;
          if (isSymmetric) {
            nextPositions[0] = glassH - clampedY;
          }
        } else {
          const prevY = nextPositions[idx - 1];
          const nextYLimit = idx < nextPositions.length - 1 ? nextPositions[idx + 1] - 30 : glassH - 40;
          const newY = Math.max(prevY + 30, Math.min(nextYLimit, prevY + numVal));
          nextPositions[idx] = newY;
          if (isSymmetric) {
            const mirrorIdx = nextPositions.length - 1 - idx;
            if (mirrorIdx !== idx) {
              nextPositions[mirrorIdx] = glassH - newY;
            }
          }
        }

        setRowPositions(nextPositions);
        setMotifs((prev) =>
          prev.map((m) => {
            if (m.gridRow !== undefined && nextPositions[m.gridRow] !== undefined) {
              return { ...m, y: nextPositions[m.gridRow] };
            }
            return m;
          })
        );
        toast.success('Đã cập nhật vị trí nan ngang');
      }
    }

    setEditingDim(null);
  };

  const handleAssignOrReplaceMotifAtCell = (colIdx: number, rowIdx: number, motifTypeId?: string) => {
    const existingIndex = motifs.findIndex((m) => m.gridCol === colIdx && m.gridRow === rowIdx);

    // Nếu đã có hoa văn tại giao điểm này:
    if (existingIndex >= 0) {
      const existing = motifs[existingIndex];
      // Khi bấm click chuột thông thường: CHỈ FILL THÔNG TIN LÊN CẠNH BÊN TRÁI, TUYỆT ĐỐI KHÔNG LÀM BIẾN MẤT / XÓA
      if (!motifTypeId) {
        setSelectedMotifId(existing.id);
        return;
      }

      // Khi người dùng chủ động KÉO THẢ (drag-and-drop) một mẫu hoa văn mới đè lên để thay thế:
      const targetType = motifTypeId;
      const def = MOTIF_DEFS.find((d) => d.id === targetType);
      const updatedPrice = getMotifDefaultPrice(targetType, existing.price ?? motifUnitPrice);
      const updated: GlassGrilleMotif = {
        ...existing,
        motifType: targetType,
        name: def?.name || 'Hoa văn nan đồng',
        width: def?.width || 100,
        height: def?.height || 100,
        price: updatedPrice,
      };
      setMotifs((prev) => {
        const next = [...prev];
        next[existingIndex] = updated;
        return next;
      });
      setSelectedMotifId(updated.id);
      toast.success(`Đã thay thế bằng: ${def?.name} (${updatedPrice.toLocaleString('vi-VN')} đ)`);
      return;
    }

    // Nếu là ô trống: Gán hoa văn mới vào giao điểm
    const targetType = motifTypeId || activeMotifTool || 'flower_classic';
    const def = MOTIF_DEFS.find((d) => d.id === targetType);
    const newId = `motif_c${colIdx}_r${rowIdx}`;
    const autoPrice = getMotifDefaultPrice(targetType, motifUnitPrice);
    const newMotif: GlassGrilleMotif = {
      id: newId,
      motifType: targetType,
      name: def?.name || 'Hoa văn nan đồng',
      gridCol: colIdx,
      gridRow: rowIdx,
      x: colPositions[colIdx],
      y: rowPositions[rowIdx],
      width: def?.width || 100,
      height: def?.height || 100,
      price: autoPrice,
    };

    setMotifs((prev) => [...prev, newMotif]);
    setSelectedMotifId(newId);
    toast.success(`Đã gán ${def?.name} (${autoPrice.toLocaleString('vi-VN')} đ) vào giao điểm (${colIdx + 1}, ${rowIdx + 1})`);
  };

  const getSvgCoordinates = (e: React.MouseEvent | MouseEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svgRef.current.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const res = pt.matrixTransform(ctm.inverse());
    return { x: res.x, y: res.y };
  };

  const handleMouseDownOnCol = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setDragTarget({ type: 'col-bar', index });
  };

  const handleMouseDownOnRow = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setDragTarget({ type: 'row-bar', index });
  };

  const handleMouseDownOnBorder = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDragTarget({ type: 'border-offset' });
  };

  const handleMouseDownOnCorner = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDragTarget({ type: 'corner-size' });
  };

  useEffect(() => {
    if (!dragTarget) return;

    const onMouseMove = (e: MouseEvent) => {
      const { x: svgX, y: svgY } = getSvgCoordinates(e);

      if (dragTarget.type === 'col-bar') {
        const idx = dragTarget.index;
        const minX = idx === 0 ? 40 : colPositions[idx - 1] + 30;
        const maxX = idx === colPositions.length - 1 ? glassW - 40 : colPositions[idx + 1] - 30;
        const newX = Math.round(Math.max(minX, Math.min(maxX, svgX)));

        setColPositions((prev) => {
          const next = [...prev];
          next[idx] = newX;

          if (isSymmetric) {
            const mirrorIdx = next.length - 1 - idx;
            if (mirrorIdx !== idx) {
              const mirrorX = Math.round(glassW - newX);
              next[mirrorIdx] = mirrorX;
            }
          }
          return next;
        });

        setMotifs((prev) =>
          prev.map((m) => {
            if (m.gridCol === idx) {
              return { ...m, x: newX };
            }
            if (isSymmetric) {
              const mirrorIdx = colPositions.length - 1 - idx;
              if (m.gridCol === mirrorIdx) {
                return { ...m, x: Math.round(glassW - newX) };
              }
            }
            return m;
          })
        );
      } else if (dragTarget.type === 'row-bar') {
        const idx = dragTarget.index;
        const minY = idx === 0 ? 50 : rowPositions[idx - 1] + 40;
        const maxY = idx === rowPositions.length - 1 ? glassH - 50 : rowPositions[idx + 1] - 40;
        const newY = Math.round(Math.max(minY, Math.min(maxY, svgY)));

        setRowPositions((prev) => {
          const next = [...prev];
          next[idx] = newY;

          if (isSymmetric) {
            const mirrorIdx = next.length - 1 - idx;
            if (mirrorIdx !== idx) {
              const mirrorY = Math.round(glassH - newY);
              next[mirrorIdx] = mirrorY;
            }
          }
          return next;
        });

        setMotifs((prev) =>
          prev.map((m) => {
            if (m.gridRow === idx) {
              return { ...m, y: newY };
            }
            if (isSymmetric) {
              const mirrorIdx = rowPositions.length - 1 - idx;
              if (m.gridRow === mirrorIdx) {
                return { ...m, y: Math.round(glassH - newY) };
              }
            }
            return m;
          })
        );
      } else if (dragTarget.type === 'border-offset') {
        const maxOffset = Math.min(glassW, glassH) / 2 - 30;
        const distFromEdge = Math.min(svgX, glassW - svgX, svgY, glassH - svgY);
        const newOffset = Math.round(Math.max(30, Math.min(maxOffset, distFromEdge)));
        setBorderOffset(newOffset);
      } else if (dragTarget.type === 'corner-size') {
        const maxCorner = Math.min(glassW, glassH) / 2 - 10;
        const distFromCornerX = Math.min(Math.abs(svgX - borderOffset), Math.abs(glassW - borderOffset - svgX));
        const distFromCornerY = Math.min(Math.abs(svgY - borderOffset), Math.abs(glassH - borderOffset - svgY));
        const newSize = Math.round(
          Math.max(borderOffset + 20, Math.min(maxCorner, Math.max(distFromCornerX, distFromCornerY) + borderOffset))
        );
        setCornerSize(newSize);
      }
    };

    const onMouseUp = () => {
      setDragTarget(null);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [dragTarget, colPositions, rowPositions, glassW, glassH, isSymmetric, borderOffset]);

  const handleUpdateSelectedMotif = (updates: Partial<GlassGrilleMotif>) => {
    if (!selectedMotifId) return;
    setMotifs((prev) =>
      prev.map((m) => (m.id === selectedMotifId ? { ...m, ...updates } : m))
    );
  };

  const handleAssignAccessoryToMotif = (accessoryIdStr: string) => {
    if (!selectedMotifId) return;
    if (!accessoryIdStr) {
      handleUpdateSelectedMotif({
        accessoryId: undefined,
        accessoryCode: undefined,
      });
      return;
    }
    const accId = Number(accessoryIdStr);
    const acc = accessories.find((a) => a.id === accId);
    if (acc) {
      handleUpdateSelectedMotif({
        accessoryId: acc.id,
        accessoryCode: acc.code || undefined,
        name: acc.name,
        price: acc.unitPrice || acc.salePrice || motifUnitPrice,
      });
      toast.success(`Đã liên kết: ${acc.name}`);
    }
  };

  const handleDeleteSelectedMotif = () => {
    if (!selectedMotifId) return;
    setMotifs((prev) => prev.filter((m) => m.id !== selectedMotifId));
    setSelectedMotifId(null);
    toast.success('Đã xóa hoa văn');
  };

  const handleClearAll = () => {
    setHasGrid(false);
    setHasBorder(false);
    setHasCorner(false);
    setMotifs([]);
    setSelectedMotifId(null);
    toast('Đã làm trống thiết kế nan');
  };

  const handleDeleteTemplate = (idStr: string) => {
    const numId = Number(idStr);
    if (!isNaN(numId)) {
      deletePatternMutation.mutate(numId);
    }
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      toast.error('Vui lòng nhập tên mẫu nan');
      return;
    }
    createPatternMutation.mutate({
      name: templateName.trim(),
      description: `${cols} cột × ${rows} hàng · Lề ${borderOffset}mm`,
      patternData: {
        hasGrid,
        hasBorder,
        hasCorner,
        cols,
        rows,
        borderOffset,
        cornerSize,
        barWidth,
        barColor,
        isSymmetric,
        colPositions,
        rowPositions,
        motifs: [...motifs],
        unitPricePerM,
        motifUnitPrice,
      },
    });
  };

  const handleApplyTemplate = (tpl: SavedTemplateItem) => {
    const c = tpl.config;
    if (c.hasGrid !== undefined) setHasGrid(c.hasGrid);
    if (c.hasBorder !== undefined) setHasBorder(c.hasBorder);
    if (c.hasCorner !== undefined) setHasCorner(c.hasCorner);

    let activeCols = colPositions;
    let activeRows = rowPositions;

    if (c.cols) {
      setCols(c.cols);
      activeCols =
        c.colPositions && c.colPositions.length === c.cols - 1
          ? c.colPositions
          : generateUniformCols(c.cols, glassW);
      setColPositions(activeCols);
    }
    if (c.rows) {
      setRows(c.rows);
      activeRows =
        c.rowPositions && c.rowPositions.length === c.rows - 1
          ? c.rowPositions
          : generateUniformRows(c.rows, glassH);
      setRowPositions(activeRows);
    }
    if (c.borderOffset) setBorderOffset(c.borderOffset);
    if (c.cornerSize) setCornerSize(c.cornerSize);
    if (c.barWidth) setBarWidth(c.barWidth);
    if (c.barColor) setBarColor(c.barColor);
    if (c.isSymmetric !== undefined) setIsSymmetric(c.isSymmetric);
    if (c.unitPricePerM !== undefined) setUnitPricePerM(c.unitPricePerM);
    if (c.motifUnitPrice !== undefined) setMotifUnitPrice(c.motifUnitPrice);

    if (c.motifs && c.motifs.length > 0) {
      const mappedMotifs = c.motifs.map((m, idx) => {
        const cx =
          m.gridCol !== undefined && activeCols[m.gridCol] !== undefined
            ? activeCols[m.gridCol]
            : m.x ?? glassW / 2;
        const ry =
          m.gridRow !== undefined && activeRows[m.gridRow] !== undefined
            ? activeRows[m.gridRow]
            : m.y ?? glassH / 2;
        return {
          ...m,
          id: m.id || `motif_tpl_${tpl.id}_${m.gridCol ?? idx}_${m.gridRow ?? idx}`,
          x: cx,
          y: ry,
          price: m.price || motifUnitPrice,
        };
      });
      setMotifs(mappedMotifs);
    } else {
      setMotifs([]);
    }

    setSelectedMotifId(null);
    toast.success(`Đã áp dụng mẫu "${tpl.name}"`);
  };

  const handleApply = () => {
    const config: GlassGrilleConfig = {
      enabled: hasGrid || hasBorder || hasCorner || motifs.length > 0,
      applyToAllSashes: applyToAll,
      glassW,
      glassH,
      installedW,
      installedH,
      hasGrid,
      hasBorder,
      hasCorner,
      barWidth,
      barColor,
      cols,
      rows,
      borderOffset,
      cornerSize,
      colPositions,
      rowPositions,
      isSymmetric,
      motifs,
      unitPricePerM,
      motifUnitPrice,
    };
    onApply(config, applyToAll);
    onClose();
  };

  let gridMm = 0;
  if (hasGrid) {
    gridMm = (cols - 1) * installedH + (rows - 1) * installedW;
  }
  let borderMm = 0;
  if (hasBorder) {
    const innerW = Math.max(0, installedW - 2 * borderOffset);
    const innerH = Math.max(0, installedH - 2 * borderOffset);
    borderMm = 2 * (innerW + innerH);
  }
  let cornerMm = 0;
  if (hasCorner) {
    cornerMm = 4 * 2 * cornerSize;
  }
  const rawMm = gridMm + borderMm + cornerMm;
  const totalM = Math.round((rawMm / 1000) * 1.05 * 100) / 100;
  const barPrice = totalM * unitPricePerM;
  const motifsPrice = motifs.reduce((sum, m) => sum + (m.price || motifUnitPrice), 0);
  const estimatedTotalPrice = Math.round(barPrice + motifsPrice);

  return {
    accessories,
    glassW,
    glassH,
    installedW,
    installedH,
    hasGrid,
    setHasGrid,
    hasBorder,
    setHasBorder,
    hasCorner,
    setHasCorner,
    barWidth,
    setBarWidth,
    barColor,
    setBarColor,
    applyToAll,
    setApplyToAll,
    cols,
    rows,
    colPositions,
    rowPositions,
    colSpans,
    rowSpans,
    isSymmetric,
    setIsSymmetric,
    borderOffset,
    setBorderOffset,
    cornerSize,
    setCornerSize,
    motifs,
    setMotifs,
    selectedMotifId,
    setSelectedMotifId,
    activeMotifTool,
    setActiveMotifTool,
    unitPricePerM,
    setUnitPricePerM,
    motifUnitPrice,
    setMotifUnitPrice,
    activeRightTab,
    setActiveRightTab,
    templateName,
    setTemplateName,
    zoom,
    setZoom,
    dragTarget,
    dragOverCell,
    setDragOverCell,
    editingDim,
    setEditingDim,
    dimInputValue,
    setDimInputValue,
    svgRef,
    selectedMotifCardRef,
    patterns,
    isLoadingPatterns,
    createPatternMutation,
    getMotifDefaultPrice,
    generateUniformCols,
    generateUniformRows,
    handleColsChange,
    handleRowsChange,
    handleOpenEditDim,
    handleSaveEditedDimension,
    handleAssignOrReplaceMotifAtCell,
    getSvgCoordinates,
    handleMouseDownOnCol,
    handleMouseDownOnRow,
    handleMouseDownOnBorder,
    handleMouseDownOnCorner,
    handleUpdateSelectedMotif,
    handleAssignAccessoryToMotif,
    handleDeleteSelectedMotif,
    handleClearAll,
    handleDeleteTemplate,
    handleSaveTemplate,
    handleApplyTemplate,
    handleApply,
    totalM,
    estimatedTotalPrice,
  };
}
