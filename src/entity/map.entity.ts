export enum MapItemTextureEnum {}
export enum MapItemTypeEnum {
  SOLID = 'solid',
  EMPTY = 'empty',
}

export interface IMapItem {
  x: number;
  y: number;
  type: MapItemTypeEnum;
  texture: MapItemTextureEnum;
}

export interface IMap {
  width: number;
  height: number;

  items: IMapItem[];
}

export class MapEntity {
  private map: IMap;

  constructor(width: number, height: number) {
    this.map = {
      width: width,
      height: height,
      items: this.magGenerate(width, height),
    };
  }

  private magGenerate(width: number, height: number) {
    const arr = [];
    const w = width - 1;
    const h = height - 1;
    for (let i = 0; i <= h; i++) {
      for (let j = 0; j <= w; j++) {
        const rand = Math.floor(Math.random() * 3);
        let texture = 5;
        if (rand === 1) {
          texture = 11;
        }

        if (rand === 2) {
          texture = 12;
        }

        if (i === 0 && j === 0) {
          texture = 1;
        } else if (i === 0 && j === w) {
          texture = 3;
        } else if (i === h && j === 0) {
          texture = 7;
        } else if (i === h && j === w) {
          texture = 9;
        } else if (i === 0 && j > 0 && j < w) {
          texture = 2;
        } else if (i === h && j > 0 && j < w) {
          texture = 8;
        } else if (j === 0 && i > 0 && i < h) {
          texture = 4;
        } else if (j === w && i > 0 && i < h) {
          texture = 6;
        }

        arr.push({
          x: j,
          y: i,
          texture: texture,
          type: texture !== 5 ? MapItemTypeEnum.SOLID : MapItemTypeEnum.EMPTY,
        });
      }
    }
    return arr;
  }

  public getMap() {
    return this.map;
  }
}
