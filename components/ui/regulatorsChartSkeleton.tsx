'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

interface RegulatorsChartSkeletonProps {
    nombre: number;
}

const RegulatorsChartSkeleton: React.FC<RegulatorsChartSkeletonProps> = ({
        nombre
      }) => {


        const [heights, setHeights] = useState<number[]>([]);

        useEffect(() => {
          const randomHeights = Array.from({ length: 3 }, () =>
            Math.random() * 80 + 40
          );
          setHeights(randomHeights);
        }, []);

  return (
    <Card className="shadow-lg animate-pulse">
    <CardHeader>
      <CardTitle className="w-1/2 h-5 bg-gray-300 rounded" />
    </CardHeader>
    <CardContent className="h-[300px] flex items-end gap-2 px-4 pb-4">
      {heights.map((height, i) => (
        <div
          key={i}
          className="flex-1 bg-gray-300 rounded-t"
          style={{ height: `${height}px` }}
        />
      ))}
    </CardContent>
  </Card>
  );
};

export default RegulatorsChartSkeleton;
