"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getYouTubeVideoId } from "@/lib/utils";
import { Button } from "@/components/ui";
import { CheckCircle, Play } from "lucide-react";

interface VideoPlayerProps {
  youtubeUrl: string;
  lessonId: string;
  userId: string;
  initialProgress: number;
  isCompleted: boolean;
}

export function VideoPlayer({
  youtubeUrl,
  lessonId,
  userId,
  initialProgress,
  isCompleted: initialCompleted,
}: VideoPlayerProps) {
  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [marking, setMarking] = useState(false);
  const videoId = getYouTubeVideoId(youtubeUrl);

  async function markAsCompleted() {
    setMarking(true);
    const supabase = createClient();

    const { error } = await supabase.from("lesson_progress").upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        completed: true,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,lesson_id",
      }
    );

    if (!error) {
      setIsCompleted(true);
    }
    setMarking(false);
  }

  if (!videoId) {
    return (
      <div className="aspect-video bg-slate-100 rounded-xl flex items-center justify-center dark:bg-slate-800">
        <p className="text-slate-500">Video nao disponivel</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="aspect-video rounded-xl overflow-hidden bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
          title="Video da aula"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isCompleted ? (
            <span className="flex items-center gap-2 text-green-600 font-medium">
              <CheckCircle className="h-5 w-5" />
              Aula concluida
            </span>
          ) : (
            <Button onClick={markAsCompleted} disabled={marking}>
              {marking ? (
                "Marcando..."
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Marcar como concluida
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
