'use client';

import { useEffect, useRef } from 'react';

const SPRITE_SRC = '/assets/alien-sprite.gif';
const MIN_SPEED = 60; // px per second
const MAX_SPEED = 140; // px per second

const randomVelocity = () => {
  const speed = MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED);
  const direction = Math.random() > 0.5 ? 1 : -1;
  return speed * direction;
};

export default function BackgroundScene() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext('2d');
    const sprite = new Image();
    sprite.src = SPRITE_SRC;

    const state = {
      width: 200,
      height: 200,
      x: 0,
      y: 0,
      vx: randomVelocity(),
      vy: randomVelocity()
    };

    let animationFrame;
    let lastTime = performance.now();

    const clampToBounds = () => {
      state.x = Math.min(Math.max(state.x, 0), canvas.width - state.width);
      state.y = Math.min(Math.max(state.y, 0), canvas.height - state.height);
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const scaleWidth = Math.min(canvas.width * 0.2, 260);
      if (sprite.naturalWidth && sprite.naturalHeight) {
        const aspect = sprite.naturalHeight / sprite.naturalWidth;
        state.width = scaleWidth;
        state.height = scaleWidth * aspect;
      } else {
        state.width = scaleWidth;
        state.height = scaleWidth;
      }
      clampToBounds();
    };

    const animate = (timestamp) => {
      const delta = (timestamp - lastTime) / 1000 || 0;
      lastTime = timestamp;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      state.x += state.vx * delta;
      state.y += state.vy * delta;

      if (state.x <= 0 || state.x + state.width >= canvas.width) {
        state.vx *= -1;
        state.x = Math.min(Math.max(state.x, 0), canvas.width - state.width);
      }

      if (state.y <= 0 || state.y + state.height >= canvas.height) {
        state.vy *= -1;
        state.y = Math.min(Math.max(state.y, 0), canvas.height - state.height);
      }

      if (sprite.complete && sprite.naturalWidth) {
        ctx.globalAlpha = 0.95;
        ctx.drawImage(sprite, state.x, state.y, state.width, state.height);
      }

      animationFrame = requestAnimationFrame(animate);
    };

    const start = () => {
      resizeCanvas();
      state.x = (canvas.width - state.width) / 2;
      state.y = (canvas.height - state.height) / 2;
      lastTime = performance.now();
      animationFrame = requestAnimationFrame(animate);
    };

    if (sprite.complete) {
      start();
    } else {
      sprite.onload = start;
    }

    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div className="background-scene" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
