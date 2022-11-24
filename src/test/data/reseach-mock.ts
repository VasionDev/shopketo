import { Research } from 'src/app/research/models/research.model';

export function mockReseach(): Research[] {
  return [
    {
      description: '<p>The video that started a müvment in 2015</p>\n',
      isWistia: true,
      thumbnailUrl:
        'https://embed-ssl.wistia.com/deliveries/7d0a0c6b343d176e2730305b7937bce3f2658866.jpg?image_crop_resized=960x540',
      title: 'The OG Breakthrough',
      videoID: '38rui536vl',
    },
  ];
}
