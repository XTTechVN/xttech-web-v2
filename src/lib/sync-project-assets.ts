import fs from 'fs';
import path from 'path';

export function syncProjectImages() {
  try {
    const targetDir = path.join(process.cwd(), 'public', 'images', 'projects');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const filesToSync: { src: string; dest: string }[] = [
      {
        src: 'C:/Users/admin/.gemini/antigravity/brain/31684b82-533b-450e-9967-9ca86953c532/.user_uploaded/media_1794390286005_949b9311.png',
        dest: 'project-overview.png',
      },
      {
        src: 'C:/Users/admin/.gemini/antigravity/brain/31684b82-533b-450e-9967-9ca86953c532/.user_uploaded/media_1794390286003_af05dfd6.png',
        dest: 'project-pricing.png',
      },
      {
        src: 'C:/Users/admin/.gemini/antigravity/brain/31684b82-533b-450e-9967-9ca86953c532/.user_uploaded/media_1794390286007_aad21fe9.png',
        dest: 'project-contract.png',
      },
      {
        src: 'C:/Users/admin/.gemini/antigravity/brain/31684b82-533b-450e-9967-9ca86953c532/.user_uploaded/media_1794390286018_01e12f16.png',
        dest: 'project-production.png',
      },
      {
        src: 'C:/Users/admin/.gemini/antigravity/brain/31684b82-533b-450e-9967-9ca86953c532/.user_uploaded/media_1794390286005_dcb4d67b.png',
        dest: 'project-spec.png',
      },
      {
        src: 'C:/Users/admin/.gemini/antigravity/brain/31684b82-533b-450e-9967-9ca86953c532/.user_uploaded/media_1794390286000_2fbe66a5.png',
        dest: 'project-ai-automation.png',
      },
      {
        src: 'C:/Users/admin/.gemini/antigravity/brain/31684b82-533b-450e-9967-9ca86953c532/.user_uploaded/media_1794390815961_5ae129b5.jpg',
        dest: 'pain-points-workshop.jpg',
      },
      {
        src: 'C:/Users/admin/.gemini/antigravity/brain/31684b82-533b-450e-9967-9ca86953c532/.user_uploaded/media_1794390285997_1bbf23d3.png',
        dest: 'pain-points-reference.png',
      },
      {
        src: 'C:/Users/admin/.gemini/antigravity/brain/31684b82-533b-450e-9967-9ca86953c532/.user_uploaded/media_1794390285998_e8a8bc3b.png',
        dest: 'screen-mockup-reference.png',
      },
    ];

    for (const item of filesToSync) {
      const destPath = path.join(targetDir, item.dest);
      if (fs.existsSync(item.src)) {
        if (!fs.existsSync(destPath) || fs.statSync(destPath).size === 0) {
          fs.copyFileSync(item.src, destPath);
        }
      }
    }
  } catch (error) {
    console.error('Error syncing project images:', error);
  }
}

// Auto run on module load
syncProjectImages();
