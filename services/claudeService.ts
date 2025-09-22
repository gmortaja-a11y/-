import { Script, TrainingData } from '../types';

// This is a mock service to simulate calling the Claude API for fast text transformation.
// In a real application, this would contain the actual API call logic using fetch or a library like Axios.

export const transformWithClaude = async (
  styleName: string,
  title: string,
  duration: string,
  language: string,
  sourceText: string,
  trainingData?: TrainingData
): Promise<Script> => {
  console.log('Transforming text with Claude API (simulation)...');

  // Simulate a faster network request than the full generation
  await new Promise(resolve => setTimeout(resolve, 500));

  const trainingNotice = trainingData?.examples && trainingData.examples.length > 0
    ? `[تم التحويل بناءً على ${trainingData.examples.length} أمثلة تدريبية مع الالتزام الصارم بالمصدر]`
    : `[تم التحويل بناءً على الإرشادات مع الالتزام الصارم بالمصدر]`;

  // Simulate a strict reformatting of the source text based on the user's style.
  const strictReformat = (text: string): string => {
      // Simple simulation: break text into short lines and add markers.
      const sentences = text.split('. ').filter(s => s.trim() !== '');
      let output = '';
      sentences.forEach((sentence, index) => {
          output += sentence.trim().replace(/،/g, ' /') + '\n';
          // Add a paragraph break every 2-3 sentences
          if ((index + 1) % 3 === 0) {
              output += '///\n';
          }
      });
      return output;
  };
  
  const transformedContent = `${trainingNotice}\n\n` + strictReformat(sourceText);

  // Return a mock Script object
  const mockScript: Script = {
    title: title,
    style: styleName,
    duration: duration,
    content: transformedContent,
    scenes: [
      {
        time: '00:00-01:00',
        description: `مقدمة تمت إعادة تنسيقها من النص المصدري`,
        visuals: 'لقطات سريعة ذات صلة بالمحتوى الأصلي',
      },
      {
        time: '01:00-05:00',
        description: 'عرض تفصيلي للمعلومات المعاد هيكلتها',
        visuals: 'رسوم بيانية، لقطات أرشيفية ذات صلة بالنص المصدري',
      },
    ],
    sources: [
      {
        name: 'Source Text provided by user',
        url: '#',
      },
      {
        name: 'Claude Transformation Engine (Simulated)',
        url: '#',
      },
    ],
  };

  console.log('Transformation complete.');
  return mockScript;
};