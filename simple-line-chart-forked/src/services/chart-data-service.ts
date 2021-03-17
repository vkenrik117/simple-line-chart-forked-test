import { std, mean } from "mathjs";
import { PageViewsModel, ChartDataModel } from "../models/ChartModels";

function generatePages(quantity: number): Object[] | undefined {
  let pages = [];
  for (var i = 0; i < quantity; i++) {
    pages.push({
      name: `page ${i}`,
      uv: Math.random() * (10000 - 0) + 0,
      pv: Math.random() * (10000 - 0) + 0,
      amt: 2400,
    });
  }
  return pages;
}

function findXByY(
  a: [x: number, y: number],
  b: [x: number, y: number],
  Y: number
): number | undefined {
  const slope = (b[1] - a[1]) / (b[0] - a[0]);
  const yIntercept = a[1] - slope * a[0];
  return (Y - yIntercept) / slope;
}

const pageQuantity = 7;

function computePercentage(intervals: [number, number], viewsParam: number[]) {
  const result = viewsParam
    .reduce((acc, viewsParam, index, array) => {
      if (index === array.length - 1) {
        acc.push(100);
        return acc;
      };
      if (
        intervals[0] >= Math.min(viewsParam, array[index + 1]) &&
        intervals[1] <= Math.max(viewsParam, array[index + 1])) {
        const X1 = findXByY(
          [index, viewsParam],
          [index + 1, array[index + 1]],
          intervals[0]
        );
        const X2 = findXByY(
          [index, viewsParam],
          [index + 1, array[index + 1]],
          intervals[1]
        );
        if (X1) {
          acc.push(100 - ((pageQuantity - X1 - 1) / (pageQuantity - 1)) * 100);
        }
        if (X2) {
          acc.push(100 - ((pageQuantity - X2 - 1) / (pageQuantity - 1)) * 100);
        }
      }
      if (
        intervals[0] >= Math.min(viewsParam, array[index + 1]) &&
        intervals[0] <= Math.max(viewsParam, array[index + 1])
      ) {
        const X = findXByY(
          [index, viewsParam],
          [index + 1, array[index + 1]],
          intervals[0]
        );
        if (X) {
          acc.push(100 - ((pageQuantity - X - 1) / (pageQuantity - 1)) * 100);
        }
        return acc;
      }
      if (
        intervals[1] >= Math.min(viewsParam, array[index + 1]) &&
        intervals[1] <= Math.max(viewsParam, array[index + 1])
      ) {
        const X = findXByY(
          [index, viewsParam],
          [index + 1, array[index + 1]],
          intervals[1]
        );
        if (X) {
          acc.push(100 - ((pageQuantity - X - 1) / (pageQuantity - 1)) * 100);
        }
      }
      return acc;
    }, [] as number[])
    .filter((item) => item !== 0 || !!item);
  result.unshift(0);
  return result;
}

const data = generatePages(pageQuantity) as PageViewsModel[];

export class ChartDataService {
  public getData(): Promise<ChartDataModel> {
    const uvAvg = mean(
      data.map((x) => x.uv),
      0
    ) as number;
    const pvAvg = mean(
      data.map((x) => x.pv),
      0
    ) as number;
    const uvStddev = std(
      data.map((x) => x.uv),
      "uncorrected"
    ) as number;
    const pvStddev = std(
      data.map((x) => x.pv),
      "uncorrected"
    ) as number;

    const uvInterval = [uvAvg - uvStddev, uvAvg + uvStddev] as [number, number];
    const uvs = data.map((d) => d.uv);

    const pvInterval = [pvAvg - pvStddev, pvAvg + pvStddev] as [number, number];
    const pvs = data.map((d) => d.pv);

    let uvPercentage = computePercentage(uvInterval, uvs);
    let pvPercentage = computePercentage(pvInterval, pvs);

    uvPercentage = uvPercentage.filter(function (item, pos, self) {
      return self.indexOf(item) === pos;
    });
    uvPercentage.sort((a, b) => a - b)

    pvPercentage = pvPercentage.filter(function (item, pos, self) {
      return self.indexOf(item) === pos;
    });
    pvPercentage.sort((a, b) => a - b)

    return Promise.resolve({
      views: data,
      pvPercentage,
      uvPercentage,
      pvInterval,
      uvInterval,
    });
  }
}
