/**
 * TonesInvadersRenderer - canvas draw pass for the tones-invaders game
 * (starfield, invaders, player ship, lasers, particles, HUD glow).
 * Extracted from TonesInvadersGame; read-only on game state, called
 * once per frame from the game loop.
 */
class TonesInvadersRenderer {
  constructor(game) {
    this.game = game;
  }

    draw() {
        // Clear canvas with space galaxy background
        this.game.ctx.fillStyle = '#070714';
        this.game.ctx.fillRect(0, 0, this.game.logicalWidth, this.game.logicalHeight);
        
        // Draw space stars
        this.game.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        for (let i = 0; i < 30; i++) {
            const starX = (Math.sin(i * 123.4) * 0.5 + 0.5) * this.game.logicalWidth;
            const starY = ((performance.now() * 0.02 + i * 20) % this.game.logicalHeight);
            this.game.ctx.fillRect(starX, starY, 2, 2);
        }
        
        // Draw launcher / spaceship
        const shipX = this.game.playerX;
        const shipY = this.game.playerY;
        
        // 1. Draw Thruster Flames (pulsing/animating behind the ship)
        const flamePulse = 8 + Math.sin(performance.now() * 0.04) * 3;
        
        // Left Engine Flame
        const leftFlameGrad = this.game.ctx.createRadialGradient(shipX - 8, shipY + 12, 1, shipX - 8, shipY + 12 + flamePulse, flamePulse);
        leftFlameGrad.addColorStop(0, '#38bdf8'); // Cyan core
        leftFlameGrad.addColorStop(0.4, '#4f46e5'); // Purple middle
        leftFlameGrad.addColorStop(1, 'rgba(79, 70, 229, 0)');
        this.game.ctx.fillStyle = leftFlameGrad;
        this.game.ctx.beginPath();
        this.game.ctx.arc(shipX - 8, shipY + 12, flamePulse, 0, Math.PI * 2);
        this.game.ctx.fill();
        
        // Right Engine Flame
        const rightFlameGrad = this.game.ctx.createRadialGradient(shipX + 8, shipY + 12, 1, shipX + 8, shipY + 12 + flamePulse, flamePulse);
        rightFlameGrad.addColorStop(0, '#38bdf8');
        rightFlameGrad.addColorStop(0.4, '#4f46e5');
        rightFlameGrad.addColorStop(1, 'rgba(79, 70, 229, 0)');
        this.game.ctx.fillStyle = rightFlameGrad;
        this.game.ctx.beginPath();
        this.game.ctx.arc(shipX + 8, shipY + 12, flamePulse, 0, Math.PI * 2);
        this.game.ctx.fill();
        
        // 2. Draw Swept Wings
        const wingGrad = this.game.ctx.createLinearGradient(shipX - 22, shipY, shipX + 22, shipY);
        wingGrad.addColorStop(0, '#06b6d4'); // Cyan wingtips
        wingGrad.addColorStop(0.3, '#3b82f6'); // Blue
        wingGrad.addColorStop(0.5, '#6366f1'); // Indigo middle
        wingGrad.addColorStop(0.7, '#3b82f6');
        wingGrad.addColorStop(1, '#06b6d4');
        
        this.game.ctx.fillStyle = wingGrad;
        this.game.ctx.beginPath();
        // Left wing
        this.game.ctx.moveTo(shipX - 6, shipY - 2);
        this.game.ctx.lineTo(shipX - 22, shipY + 12);
        this.game.ctx.lineTo(shipX - 18, shipY + 15);
        this.game.ctx.lineTo(shipX - 6, shipY + 8);
        // Right wing
        this.game.ctx.lineTo(shipX + 6, shipY + 8);
        this.game.ctx.lineTo(shipX + 18, shipY + 15);
        this.game.ctx.lineTo(shipX + 22, shipY + 12);
        this.game.ctx.lineTo(shipX + 6, shipY - 2);
        this.game.ctx.closePath();
        this.game.ctx.fill();
        
        // 3. Draw Wingtip Cannons
        this.game.ctx.fillStyle = '#06b6d4';
        this.game.ctx.shadowBlur = 6;
        this.game.ctx.shadowColor = '#06b6d4';
        // Left cannon
        this.game.ctx.fillRect(shipX - 23, shipY + 2, 2, 10);
        // Right cannon
        this.game.ctx.fillRect(shipX + 21, shipY + 2, 2, 10);
        this.game.ctx.shadowBlur = 0;
        
        // 4. Draw Main Fuselage (Metallic Body)
        const bodyGrad = this.game.ctx.createLinearGradient(shipX, shipY - 22, shipX, shipY + 12);
        bodyGrad.addColorStop(0, '#c7d2fe'); // Indigo-200 (nose tip highlight)
        bodyGrad.addColorStop(0.4, '#6366f1'); // Indigo-500
        bodyGrad.addColorStop(1, '#1e1b4b'); // Indigo-950
        
        this.game.ctx.fillStyle = bodyGrad;
        this.game.ctx.beginPath();
        this.game.ctx.moveTo(shipX, shipY - 22); // Sharp nose
        this.game.ctx.lineTo(shipX + 6, shipY - 5);
        this.game.ctx.lineTo(shipX + 6, shipY + 12);
        this.game.ctx.lineTo(shipX - 6, shipY + 12);
        this.game.ctx.lineTo(shipX - 6, shipY - 5);
        this.game.ctx.closePath();
        this.game.ctx.fill();
        
        // 5. Draw Glowing Energy Reactor Core (changes color to match the last fired tone!)
        const activeTone = this.game.lastFiredTone || 5;
        const coreColor = this.game.toneColors[activeTone] || '#06b6d4';
        
        this.game.ctx.shadowBlur = 15;
        this.game.ctx.shadowColor = coreColor;
        this.game.ctx.fillStyle = coreColor;
        this.game.ctx.beginPath();
        this.game.ctx.arc(shipX, shipY + 4, 6, 0, Math.PI * 2);
        this.game.ctx.fill();
        this.game.ctx.shadowBlur = 0;
        
        // Inner white-hot plasma core
        this.game.ctx.fillStyle = '#ffffff';
        this.game.ctx.beginPath();
        this.game.ctx.arc(shipX, shipY + 4, 2.5, 0, Math.PI * 2);
        this.game.ctx.fill();
        
        // 6. Draw Glass Cockpit Canopy
        const canopyGrad = this.game.ctx.createLinearGradient(shipX, shipY - 12, shipX, shipY - 2);
        canopyGrad.addColorStop(0, '#e0f2fe'); // Ice blue
        canopyGrad.addColorStop(1, '#0284c7'); // Sky blue
        
        this.game.ctx.fillStyle = canopyGrad;
        this.game.ctx.beginPath();
        this.game.ctx.ellipse(shipX, shipY - 7, 3.5, 6, 0, 0, Math.PI * 2);
        this.game.ctx.fill();
        
        // Sleek cyan highlight outline around the body
        this.game.ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
        this.game.ctx.lineWidth = 1.5;
        this.game.ctx.stroke();
        
        // Draw invaders
        this.game.ctx.textAlign = 'center';
        this.game.ctx.textBaseline = 'middle';
        
        this.game.invaders.forEach(inv => {
            // Draw character aura based on tone
            const color = this.game.toneColors[inv.tone] || '#ffffff';
            this.game.ctx.fillStyle = color;
            this.game.ctx.shadowBlur = 15;
            this.game.ctx.shadowColor = color;
            
            // Draw circle background
            this.game.ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
            this.game.ctx.strokeStyle = color;
            this.game.ctx.lineWidth = 2;
            this.game.ctx.beginPath();
            this.game.ctx.arc(inv.x, inv.y, 20, 0, Math.PI * 2);
            this.game.ctx.fill();
            this.game.ctx.stroke();
            
            // Draw character text
            this.game.ctx.shadowBlur = 0;
            this.game.ctx.fillStyle = '#ffffff';
            this.game.ctx.font = '22px "Noto Sans SC", sans-serif';
            this.game.ctx.fillText(inv.char, inv.x, inv.y - 2);
            
            // Draw subtexts
            this.game.ctx.fillStyle = '#94a3b8';
            this.game.ctx.font = '10px "Inter", sans-serif';
            this.game.ctx.fillText(inv.translation, inv.x, inv.y + 30);
        });
        
        // Draw lasers
        this.game.lasers.forEach(laser => {
            this.game.ctx.fillStyle = laser.color;
            this.game.ctx.shadowBlur = 10;
            this.game.ctx.shadowColor = laser.color;
            
            this.game.ctx.fillRect(laser.x - 2, laser.y - 12, 4, 15);
            
            this.game.ctx.shadowBlur = 0;
        });
        
        // Draw particles
        this.game.ctx.shadowBlur = 0; // Ensure no shadow blur leaks to particles
        for (let i = 0; i < this.game.particlePool.length; i++) {
            const p = this.game.particlePool[i];
            if (p.active) {
                this.game.ctx.fillStyle = p.color;
                this.game.ctx.fillRect(p.x, p.y, p.size, p.size);
            }
        }
    }

}

window.TonesInvadersRenderer = TonesInvadersRenderer;
