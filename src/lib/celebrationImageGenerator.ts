import { type ChallengeData } from '@/hooks/useCelebrationData';

interface CelebrationImageOptions {
  width?: number;
  height?: number;
  format?: 'png' | 'jpeg';
  quality?: number;
  deviceType?: 'mobile' | 'tablet' | 'desktop';
  scaleFactor?: number;
}

export class CelebrationImageGenerator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private scaleFactor: number;
  private deviceType: 'mobile' | 'tablet' | 'desktop';

  constructor(options: CelebrationImageOptions = {}) {
    // Determine optimal dimensions based on device type
    const deviceConfig = this.getDeviceConfig(options.deviceType);
    
    this.width = options.width || deviceConfig.width;
    this.height = options.height || deviceConfig.height;
    this.scaleFactor = options.scaleFactor || deviceConfig.scaleFactor;
    this.deviceType = options.deviceType || 'desktop';
    
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    this.ctx = ctx;
  }

  async generateCelebrationImage(data: ChallengeData): Promise<string> {
    // Validate and sanitize input data
    const validatedData = this.validateAndSanitizeData(data);
    
    // Ensure stable rendering environment
    await this.prepareStableRenderingContext();
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Create professional Instagram Stories style design
    await this.drawProfessionalBackground();
    await this.drawProfessionalHeader();
    await this.drawPersonalizedGreeting(validatedData.patientName);
    await this.drawProgressCircle(validatedData.totalScore, validatedData.stats);
    await this.drawStatisticsBlocks(validatedData.stats, validatedData.totalScore);
    await this.drawAchievementsSection();
    await this.drawMotivationalSection();
    await this.drawFinalProgressBar(validatedData.stats);
    await this.drawProfessionalBranding();
    
    // Ensure all drawing operations are complete
    await this.finalizeRendering();
    
    // Return base64 image
    return this.canvas.toDataURL('image/png', 0.95);
  }

  // Professional gradient background like Instagram Stories
  private async drawProfessionalBackground(): Promise<void> {
    // Create sophisticated gradient background
    const bgGradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    bgGradient.addColorStop(0, '#0c0a09');    // zinc-950
    bgGradient.addColorStop(0.3, '#18181b');  // zinc-900
    bgGradient.addColorStop(0.7, '#27272a');  // zinc-800
    bgGradient.addColorStop(1, '#3f3f46');    // zinc-700
    
    this.ctx.fillStyle = bgGradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Add decorative elements
    // Top right decorative circle
    const decorGradient1 = this.ctx.createRadialGradient(
      this.scaleDimension(900), this.scaleDimension(300), 0,
      this.scaleDimension(900), this.scaleDimension(300), this.scaleDimension(200)
    );
    decorGradient1.addColorStop(0, 'rgba(245, 158, 11, 0.4)'); // amber-500
    decorGradient1.addColorStop(1, 'rgba(245, 158, 11, 0.0)');
    
    this.ctx.fillStyle = decorGradient1;
    this.ctx.beginPath();
    this.ctx.arc(
      this.scaleDimension(900), 
      this.scaleDimension(300), 
      this.scaleDimension(200), 
      0, 2 * Math.PI
    );
    this.ctx.fill();
    
    // Bottom left decorative circle
    const decorGradient2 = this.ctx.createRadialGradient(
      this.scaleDimension(180), this.scaleDimension(1500), 0,
      this.scaleDimension(180), this.scaleDimension(1500), this.scaleDimension(150)
    );
    decorGradient2.addColorStop(0, 'rgba(245, 158, 11, 0.3)');
    decorGradient2.addColorStop(1, 'rgba(245, 158, 11, 0.0)');
    
    this.ctx.fillStyle = decorGradient2;
    this.ctx.beginPath();
    this.ctx.arc(
      this.scaleDimension(180), 
      this.scaleDimension(1500), 
      this.scaleDimension(150), 
      0, 2 * Math.PI
    );
    this.ctx.fill();
  }

  private async drawProfessionalHeader(): Promise<void> {
    // Badge "DESAFIO CONCLUÍDO"
    const badgeWidth = this.scaleDimension(400);
    const badgeHeight = this.scaleDimension(60);
    const badgeX = (this.width - badgeWidth) / 2;
    const badgeY = this.scaleDimension(100);

    // Background do badge
    const badgeGradient = this.ctx.createLinearGradient(badgeX, badgeY, badgeX + badgeWidth, badgeY + badgeHeight);
    badgeGradient.addColorStop(0, '#f59e0b'); // amber-500
    badgeGradient.addColorStop(1, '#d97706'); // amber-600

    this.ctx.fillStyle = badgeGradient;
    this.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 30);
    this.ctx.fill();

    // Texto do badge
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = `bold ${this.scaleFont(32)}px Arial, sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.fillText('🏆 DESAFIO CONCLUÍDO 🏆', this.width / 2, badgeY + badgeHeight / 2);

    // Título principal
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = `bold ${this.scaleFont(56)}px Arial, sans-serif`;
    this.ctx.fillText('Shape Express', this.width / 2, this.scaleDimension(240));

    // Subtítulo
    this.ctx.fillStyle = '#d4d4d8'; // zinc-300
    this.ctx.font = `${this.scaleFont(36)}px Arial, sans-serif`;
    this.ctx.fillText('Desafio Nutricional', this.width / 2, this.scaleDimension(300));
  }

  private async drawPersonalizedGreeting(name: string): Promise<void> {
    // Nome personalizado
    this.ctx.fillStyle = '#f59e0b'; // amber-500
    this.ctx.font = `bold ${this.scaleFont(48)}px Arial, sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`Parabéns, ${name}!`, this.width / 2, this.scaleDimension(380));

    // Descrição
    this.ctx.fillStyle = '#a1a1aa'; // zinc-400
    this.ctx.font = `${this.scaleFont(28)}px Arial, sans-serif`;
    this.ctx.fillText(`Você completou com sucesso o desafio de 7 dias!`, this.width / 2, this.scaleDimension(430));
  }

  private async drawChallengeDescription(): Promise<void> {
    // Add text shadow for better readability
    this.addTextShadow();
    
    // Challenge completion description with high contrast
    this.ctx.fillStyle = '#1F2937'; // gray-800 - darker for better contrast
    this.ctx.font = 'bold 24px Arial';
    this.ctx.textAlign = 'center';
    
    // Split text into multiple lines for better readability
    const lines = [
      'Você completou com sucesso o Desafio Shape Express de',
      '7 dias! Continue mantendo esses hábitos saudáveis',
      'em sua rotina.'
    ];
    
    let yPosition = 390;
    lines.forEach((line, index) => {
      this.ctx.fillText(line, this.width / 2, yPosition + (index * 35));
    });
    
    this.removeTextShadow();
  }

  private async drawProgressCircle(totalScore: number, stats: any): Promise<void> {
    const centerX = this.width / 2;
    const centerY = this.scaleDimension(600);
    const outerRadius = this.scaleDimension(140);
    
    // Calcular porcentagem de conclusão (assumindo 100% se completou o desafio)
    const completionPercentage = 100;

    // Círculo de fundo
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.lineWidth = 30;
    this.ctx.stroke();

    // Círculo de progresso
    const progressAngle = (completionPercentage / 100) * 2 * Math.PI;
    const progressGradient = this.ctx.createLinearGradient(centerX - outerRadius, centerY - outerRadius, centerX + outerRadius, centerY + outerRadius);
    progressGradient.addColorStop(0, '#f59e0b'); // amber-500
    progressGradient.addColorStop(0.5, '#fbbf24'); // amber-400
    progressGradient.addColorStop(1, '#f59e0b'); // amber-500

    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, outerRadius, -Math.PI / 2, -Math.PI / 2 + progressAngle);
    this.ctx.strokeStyle = progressGradient;
    this.ctx.lineWidth = 30;
    this.ctx.lineCap = 'round';
    this.ctx.stroke();

    // Texto da porcentagem
    this.ctx.fillStyle = '#f59e0b';
    this.ctx.font = `bold ${this.scaleFont(72)}px Arial, sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`${completionPercentage}%`, centerX, centerY - 10);

    // Texto "CONCLUÍDO"
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = `bold ${this.scaleFont(28)}px Arial, sans-serif`;
    this.ctx.fillText('CONCLUÍDO', centerX, centerY + 30);
  }
    this.addTextShadow('#000000', 2, 2, 4);
    this.ctx.fillStyle = '#FFFFFF'; // Pure white for maximum contrast
    this.ctx.font = 'bold 64px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(totalScore.toString(), this.width / 2, containerY + 70);
    
    // "pontos totais" text
    this.ctx.font = 'bold 18px Arial';
    this.ctx.fillText('pontos totais', this.width / 2, containerY + 95);
    
    this.removeTextShadow();
  }

  private async drawMotivationalBlocks(): Promise<void> {
    const startY = 680;
    const blockWidth = 480;
    const blockHeight = 140;
    const spacing = 40;
    
    // Motivação Diária Block
    const block1X = (this.width - blockWidth) / 2;
    const block1Y = startY;
    
    // Solid white background for maximum contrast
    this.ctx.fillStyle = '#FFFFFF';
    this.roundRect(block1X, block1Y, blockWidth, blockHeight, 15);
    this.ctx.fill();
    
    // Darker border for better definition
    this.ctx.strokeStyle = '#1E40AF'; // blue-800
    this.ctx.lineWidth = 3;
    this.ctx.stroke();
    
    // Emoji
    this.ctx.font = '32px Arial';
    this.ctx.fillText('💪', this.width / 2, block1Y + 40);
    
    // Title with high contrast
    this.ctx.fillStyle = '#000000'; // Pure black
    this.ctx.font = 'bold 24px Arial';
    this.ctx.fillText('Motivação Diária', this.width / 2, block1Y + 70);
    
    // Quote with high contrast
    this.ctx.fillStyle = '#1F2937'; // gray-800
    this.ctx.font = 'bold 18px Arial'; // Made bold for better readability
    this.ctx.fillText('"Você não precisa ser extremo, apenas consistente."', this.width / 2, block1Y + 100);
    
    // Mais Energia Block
    const block2Y = startY + blockHeight + spacing;
    
    // Solid white background for maximum contrast
    this.ctx.fillStyle = '#FFFFFF';
    this.roundRect(block1X, block2Y, blockWidth, blockHeight, 15);
    this.ctx.fill();
    
    // Darker border for better definition
    this.ctx.strokeStyle = '#166534'; // green-800
    this.ctx.lineWidth = 3;
    this.ctx.stroke();
    
    // Emoji
    this.ctx.font = '32px Arial';
    this.ctx.fillText('⚡', this.width / 2, block2Y + 40);
    
    // Title with high contrast
    this.ctx.fillStyle = '#000000'; // Pure black
    this.ctx.font = 'bold 24px Arial';
    this.ctx.fillText('Mais Energia', this.width / 2, block2Y + 70);
    
    // Description with high contrast
    this.ctx.fillStyle = '#1F2937'; // gray-800
    this.ctx.font = 'bold 16px Arial'; // Made bold for better readability
    const energyLines = [
      '"Aumente seus níveis de energia e disposição',
      'com hábitos saudáveis consistentes."'
    ];
    energyLines.forEach((line, index) => {
      this.ctx.fillText(line, this.width / 2, block2Y + 95 + (index * 20));
    });
  }

  private async drawAchievementsSection(): Promise<void> {
    const centerX = this.width / 2;
    
    // Título da seção
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = `bold ${this.scaleFont(36)}px Arial, sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.fillText('✨ CONQUISTAS DESBLOQUEADAS ✨', centerX, this.scaleDimension(1050));

    // Ícones de conquista
    const achievementY = this.scaleDimension(1150);
    const achievementIcons = ['🏆', '⭐', '💪', '🔥', '🎯', '👑'];
    const iconSpacing = this.scaleDimension(150);
    const iconsStartX = (this.width - (achievementIcons.length - 1) * iconSpacing) / 2;

    achievementIcons.forEach((icon, index) => {
      const iconX = iconsStartX + index * iconSpacing;

      // Background circular para o ícone
      this.ctx.beginPath();
      this.ctx.arc(iconX, achievementY, this.scaleDimension(40), 0, 2 * Math.PI);
      this.ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
      this.ctx.fill();

      this.ctx.strokeStyle = '#f59e0b';
      this.ctx.lineWidth = 3;
      this.ctx.stroke();

      // Ícone
      this.ctx.fillStyle = '#f59e0b';
      this.ctx.font = `${this.scaleFont(48)}px Arial, sans-serif`;
      this.ctx.fillText(icon, iconX, achievementY);
    });
  }

  private async drawMotivationalSection(): Promise<void> {
    const motivationY = this.scaleDimension(1300);

    // Bloco de Motivação
    this.ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
    this.roundRect(this.scaleDimension(80), motivationY - this.scaleDimension(40), this.scaleDimension(400), this.scaleDimension(100), 20);
    this.ctx.fill();

    this.ctx.fillStyle = '#f59e0b';
    this.ctx.font = `bold ${this.scaleFont(28)}px Arial, sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.fillText('💪 MOTIVAÇÃO', this.scaleDimension(280), motivationY - this.scaleDimension(10));
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = `${this.scaleFont(20)}px Arial, sans-serif`;
    this.ctx.fillText('Nível máximo!', this.scaleDimension(280), motivationY + this.scaleDimension(20));

    // Bloco de Energia
    this.ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
    this.roundRect(this.scaleDimension(600), motivationY - this.scaleDimension(40), this.scaleDimension(400), this.scaleDimension(100), 20);
    this.ctx.fill();

    this.ctx.fillStyle = '#10b981';
    this.ctx.font = `bold ${this.scaleFont(28)}px Arial, sans-serif`;
    this.ctx.fillText('⚡ ENERGIA', this.scaleDimension(800), motivationY - this.scaleDimension(10));
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = `${this.scaleFont(20)}px Arial, sans-serif`;
    this.ctx.fillText('Renovada!', this.scaleDimension(800), motivationY + this.scaleDimension(20));
  }

  private async drawFinalProgressBar(stats: any): Promise<void> {
    const progressBarY = this.scaleDimension(1450);
    const barWidth = this.scaleDimension(800);
    const barHeight = this.scaleDimension(20);
    const barX = (this.width - barWidth) / 2;
    const completionPercentage = 100; // Assumindo 100% de conclusão

    // Background da barra
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    this.roundRect(barX, progressBarY, barWidth, barHeight, 10);
    this.ctx.fill();

    // Progresso da barra
    const progressWidth = (completionPercentage / 100) * barWidth;
    const barGradient = this.ctx.createLinearGradient(barX, progressBarY, barX + progressWidth, progressBarY + barHeight);
    barGradient.addColorStop(0, '#f59e0b');
    barGradient.addColorStop(1, '#fbbf24');

    this.ctx.fillStyle = barGradient;
    this.roundRect(barX, progressBarY, progressWidth, barHeight, 10);
    this.ctx.fill();

    // Mensagem final
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = `bold ${this.scaleFont(42)}px Arial, sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Parabéns por esta conquista incrível!', this.width / 2, this.scaleDimension(1550));

    this.ctx.fillStyle = '#d4d4d8';
    this.ctx.font = `${this.scaleFont(28)}px Arial, sans-serif`;
    this.ctx.fillText('Continue assim e alcance seus objetivos! 🚀', this.width / 2, this.scaleDimension(1600));
  }

  private async drawProfessionalBranding(): Promise<void> {
    const centerX = this.width / 2;
    
    // Branding final
    this.ctx.fillStyle = '#f59e0b';
    this.ctx.font = `bold ${this.scaleFont(36)}px Arial, sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Shape Express', centerX, this.scaleDimension(1720));

    this.ctx.fillStyle = '#a1a1aa';
    this.ctx.font = `${this.scaleFont(24)}px Arial, sans-serif`;
    this.ctx.fillText('Transformando vidas através da nutrição', centerX, this.scaleDimension(1760));

    this.ctx.fillStyle = '#f59e0b';
    this.ctx.font = `bold ${this.scaleFont(22)}px Arial, sans-serif`;
    this.ctx.fillText('shapeexpress.com', centerX, this.scaleDimension(1800));
  }

  private async drawEvolutionSection(stats: any, totalScore: number): Promise<void> {
    if (!stats) return;
    
    const startY = 1000;
    const sectionWidth = 900;
    const sectionX = (this.width - sectionWidth) / 2;
    
    // Evolution section background - solid white for maximum contrast
    this.ctx.fillStyle = '#FFFFFF';
    this.roundRect(sectionX, startY, sectionWidth, 400, 20);
    this.ctx.fill();
    
    // Darker border for better definition
    this.ctx.strokeStyle = '#B45309'; // amber-700
    this.ctx.lineWidth = 4;
    this.ctx.stroke();
    
    // Trophy emoji and title
    this.ctx.font = '40px Arial';
    this.ctx.fillText('🏆', this.width / 2, startY + 50);
    
    // Title with high contrast
    this.ctx.fillStyle = '#000000'; // Pure black
    this.ctx.font = 'bold 28px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Sua Evolução', this.width / 2, startY + 90);
    
    // Subtitle with high contrast
    this.ctx.fillStyle = '#1F2937'; // gray-800
    this.ctx.font = 'bold 16px Arial'; // Made bold
    this.ctx.fillText('Estatísticas do seu desafio de 7 dias', this.width / 2, startY + 115);
    
    // Stats grid (2x2)
    const statBoxWidth = 180;
    const statBoxHeight = 100;
    const gridSpacing = 40;
    const gridStartX = sectionX + 100;
    const gridStartY = startY + 150;
    
    const displayAverageScore = Math.round(totalScore / 7);
    
    const statItems = [
      { 
        label: 'Dias Perfeitos', 
        value: stats.perfectDays || 1, 
        emoji: '🏆',
        color: '#92400E', // amber-800 - much darker for AAA
        borderColor: '#451A03' // amber-900
      },
      { 
        label: 'Média de Pontos', 
        value: displayAverageScore, 
        emoji: '🎯',
        color: '#1E40AF', // blue-800 - darker
        borderColor: '#1E3A8A' // blue-900
      },
      { 
        label: 'Melhoria', 
        value: `${stats.improvementPercent > 0 ? '+' : ''}${stats.improvementPercent || -71}%`, 
        emoji: '📈',
        color: '#166534', // green-800 - darker
        borderColor: '#14532D' // green-900
      },
      { 
        label: 'Sequência Máxima', 
        value: stats.streakRecord || 1, 
        emoji: '🔥',
        color: '#C2410C', // orange-700 - darker
        borderColor: '#9A3412' // orange-800
      }
    ];
    
    statItems.forEach((stat, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = gridStartX + col * (statBoxWidth + gridSpacing);
      const y = gridStartY + row * (statBoxHeight + gridSpacing);
      
      // Stat box background - solid white
      this.ctx.fillStyle = '#FFFFFF';
      this.roundRect(x, y, statBoxWidth, statBoxHeight, 10);
      this.ctx.fill();
      
      // Stat box border - darker and more opaque
      this.ctx.strokeStyle = stat.borderColor;
      this.ctx.lineWidth = 3;
      this.ctx.stroke();
      
      // Emoji
      this.ctx.font = '24px Arial';
      this.ctx.fillText(stat.emoji, x + statBoxWidth / 2, y + 30);
      
      // Value with high contrast
      this.ctx.fillStyle = stat.color;
      this.ctx.font = 'bold 24px Arial';
      this.ctx.fillText(stat.value.toString(), x + statBoxWidth / 2, y + 55);
      
      // Label with high contrast
      this.ctx.fillStyle = '#000000'; // Pure black
      this.ctx.font = 'bold 12px Arial'; // Made bold
      this.ctx.fillText(stat.label, x + statBoxWidth / 2, y + 75);
    });
    
    // Progress section
    const progressY = startY + 320;
    this.ctx.fillStyle = '#000000'; // Pure black
    this.ctx.font = 'bold 18px Arial';
    this.ctx.fillText('Progresso do Desafio', this.width / 2, progressY);
    
    this.ctx.fillStyle = '#B45309'; // amber-700 - darker
    this.ctx.font = 'bold 16px Arial';
    this.ctx.fillText('100%', this.width / 2 + 200, progressY);
    
    // Progress bar
    const progressBarWidth = 400;
    const progressBarHeight = 20;
    const progressBarX = (this.width - progressBarWidth) / 2;
    const progressBarY = progressY + 15;
    
    // Progress bar background
    this.ctx.fillStyle = '#D1D5DB'; // gray-300 - darker background
    this.roundRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight, 10);
    this.ctx.fill();
    
    // Progress bar fill with darker gradient
    const progressGradient = this.ctx.createLinearGradient(
      progressBarX, progressBarY,
      progressBarX + progressBarWidth, progressBarY
    );
    progressGradient.addColorStop(0, '#B45309'); // amber-700
    progressGradient.addColorStop(0.5, '#C2410C'); // orange-700
    progressGradient.addColorStop(1, '#B45309'); // amber-700
    
    this.ctx.fillStyle = progressGradient;
    this.roundRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight, 10);
    this.ctx.fill();
    
    // Completion message with high contrast
    this.ctx.fillStyle = '#000000'; // Pure black
    this.ctx.font = 'bold 16px Arial';
    this.ctx.fillText('🎉 Desafio Completado com Sucesso! 🎉', this.width / 2, progressY + 55);
  }

  private async drawBranding(): Promise<void> {
    // Add text shadow for better readability
    this.addTextShadow();
    
    // Shape Express branding with high contrast
    this.ctx.fillStyle = '#000000'; // Pure black for maximum contrast
    this.ctx.font = 'bold 28px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Shape Express', this.width / 2, this.height - 100);
    
    // Tagline with high contrast
    this.ctx.fillStyle = '#1F2937'; // gray-800 - darker
    this.ctx.font = 'bold 20px Arial'; // Made bold for better readability
    this.ctx.fillText('Transformando vidas através de hábitos saudáveis', this.width / 2, this.height - 60);
    
    this.removeTextShadow();
  }

  private async drawDecorations(): Promise<void> {
    // Minimal decorative elements that don't interfere with text readability
    this.ctx.fillStyle = '#FCD34D'; // amber-300
    this.ctx.globalAlpha = 0.08; // Much more subtle
    
    // Only corner decorations, away from text areas
    // Top left decoration - smaller and more subtle
    this.ctx.beginPath();
    this.ctx.arc(80, 80, 30, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Top right decoration - smaller and more subtle
    this.ctx.beginPath();
    this.ctx.arc(this.width - 80, 80, 25, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Bottom left decoration - smaller and more subtle
    this.ctx.beginPath();
    this.ctx.arc(80, this.height - 80, 25, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Bottom right decoration - smaller and more subtle
    this.ctx.beginPath();
    this.ctx.arc(this.width - 80, this.height - 80, 20, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.globalAlpha = 1;
  }

  // Get device-specific configuration
  private getDeviceConfig(deviceType?: 'mobile' | 'tablet' | 'desktop') {
    const configs = {
      mobile: {
        width: 720,
        height: 1280,
        scaleFactor: 0.67,
        minFontSize: 16,
        maxFontSize: 48
      },
      tablet: {
        width: 900,
        height: 1600,
        scaleFactor: 0.83,
        minFontSize: 18,
        maxFontSize: 56
      },
      desktop: {
        width: 1080,
        height: 1920,
        scaleFactor: 1,
        minFontSize: 20,
        maxFontSize: 64
      }
    };

    return configs[deviceType || 'desktop'];
  }

  // Scale font size based on device
  private scaleFont(baseSize: number): number {
    const scaled = Math.round(baseSize * this.scaleFactor);
    const config = this.getDeviceConfig(this.deviceType);
    return Math.max(config.minFontSize, Math.min(scaled, config.maxFontSize));
  }

  // Scale dimensions based on device
  private scaleDimension(baseDimension: number): number {
    return Math.round(baseDimension * this.scaleFactor);
  }

  // Prepare stable rendering context
  private async prepareStableRenderingContext(): Promise<void> {
    // Ensure canvas is properly initialized
    if (!this.ctx) {
      throw new Error('Canvas context not available');
    }

    // Reset any existing transformations
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    // Set consistent rendering properties
    this.ctx.imageSmoothingEnabled = true;
    (this.ctx as any).imageSmoothingQuality = 'high';
    
    // Ensure text rendering is consistent
    this.ctx.textBaseline = 'middle';
    this.ctx.textAlign = 'center';
    
    // Clear any existing shadows or effects
    this.removeTextShadow();
    
    // Force synchronous layout if in browser environment
    if (typeof window !== 'undefined' && window.requestAnimationFrame) {
      await new Promise(resolve => {
        window.requestAnimationFrame(() => {
          // Force layout calculation
          if (document.body) {
            document.body.offsetHeight;
          }
          resolve(void 0);
        });
      });
    }
  }

  // Finalize rendering to ensure consistency
  private async finalizeRendering(): Promise<void> {
    // Ensure all drawing operations are flushed
    if (typeof window !== 'undefined') {
      // Force a repaint cycle
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    // Reset context state
    this.removeTextShadow();
    this.ctx.globalAlpha = 1;
    this.ctx.globalCompositeOperation = 'source-over';
  }

  // Validate and sanitize input data with fallbacks
  private validateAndSanitizeData(data: ChallengeData): ChallengeData {
    const sanitized: ChallengeData = {
      patientName: this.sanitizeName(data.patientName),
      totalScore: this.validateScore(data.totalScore),
      challengeDuration: data.challengeDuration || 7,
      dailyScores: data.dailyScores || [],
      stats: this.validateStats(data.stats)
    };

    return sanitized;
  }

  // Sanitize patient name with fallback
  private sanitizeName(name: string | null | undefined): string {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return 'Usuário';
    }
    
    // Remove potentially problematic characters and limit length
    const sanitized = name.trim().substring(0, 50);
    
    // Ensure it's not just whitespace or special characters
    if (!/[a-zA-ZÀ-ÿ0-9]/.test(sanitized)) {
      return 'Usuário';
    }
    
    return sanitized;
  }

  // Validate score with fallback
  private validateScore(score: number | null | undefined): number {
    if (typeof score !== 'number' || isNaN(score) || score < 0) {
      return 0;
    }
    
    // Cap at reasonable maximum
    return Math.min(score, 9999);
  }

  // Validate stats with fallbacks
  private validateStats(stats: any): any {
    if (!stats || typeof stats !== 'object') {
      return {
        completedDays: 7,
        averageScore: 0,
        bestDay: { day: 1, score: 0 },
        improvementTrend: 'stable',
        perfectDays: 0,
        improvementPercent: 0,
        streakRecord: 0
      };
    }

    return {
      completedDays: typeof stats.completedDays === 'number' ? Math.max(0, Math.min(stats.completedDays, 7)) : 7,
      averageScore: typeof stats.averageScore === 'number' ? Math.max(0, stats.averageScore) : 0,
      bestDay: stats.bestDay || { day: 1, score: 0 },
      improvementTrend: stats.improvementTrend || 'stable',
      perfectDays: typeof stats.perfectDays === 'number' ? Math.max(0, stats.perfectDays) : 0,
      improvementPercent: typeof stats.improvementPercent === 'number' ? stats.improvementPercent : 0,
      streakRecord: typeof stats.streakRecord === 'number' ? Math.max(0, stats.streakRecord) : 0
    };
  }

  // Helper method to add text shadow for better readability
  private addTextShadow(color: string = '#FFFFFF', offsetX: number = 1, offsetY: number = 1, blur: number = 2): void {
    (this.ctx as any).shadowColor = color;
    (this.ctx as any).shadowOffsetX = offsetX;
    (this.ctx as any).shadowOffsetY = offsetY;
    (this.ctx as any).shadowBlur = blur;
  }

  // Helper method to remove text shadow
  private removeTextShadow(): void {
    (this.ctx as any).shadowColor = 'transparent';
    (this.ctx as any).shadowOffsetX = 0;
    (this.ctx as any).shadowOffsetY = 0;
    (this.ctx as any).shadowBlur = 0;
  }

  // Helper method to draw rounded rectangles (for older browsers)
  private roundRect(x: number, y: number, width: number, height: number, radius: number): void {
    if ((this.ctx as any).roundRect) {
      (this.ctx as any).roundRect(x, y, width, height, radius);
    } else {
      // Fallback for older browsers
      this.ctx.beginPath();
      this.ctx.moveTo(x + radius, y);
      this.ctx.lineTo(x + width - radius, y);
      this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      this.ctx.lineTo(x + width, y + height - radius);
      this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      this.ctx.lineTo(x + radius, y + height);
      this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      this.ctx.lineTo(x, y + radius);
      this.ctx.quadraticCurveTo(x, y, x + radius, y);
      this.ctx.closePath();
    }
  }
}

// Utility function to download the generated image
export function downloadImage(dataUrl: string, filename: string = 'celebracao-shape-express.png'): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Utility function to share image (if Web Share API is available)
export async function shareImage(dataUrl: string, data: ChallengeData): Promise<void> {
  if (navigator.share && navigator.canShare) {
    try {
      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'celebracao-shape-express.png', { type: 'image/png' });
      
      const shareData = {
        title: 'Desafio Shape Express Concluído!',
        text: `Acabei de concluir o Desafio Shape Express com ${data.totalScore} pontos! 🏆`,
        files: [file]
      };
      
      if (navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback to download
        downloadImage(dataUrl);
      }
    } catch (error) {
      console.error('Error sharing image:', error);
      // Fallback to download
      downloadImage(dataUrl);
    }
  } else {
    // Fallback to download
    downloadImage(dataUrl);
  }
}