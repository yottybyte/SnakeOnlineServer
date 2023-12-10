export enum MapItemTextureEnum {}
export enum MapItemTypeEnum {
  SOLID = 'solid',
  EMPTY = 'empty',
}

export interface IMapPhysicalItem  {
  x: number;
  y: number;
  type: MapItemTypeEnum;
}

export interface IMapItem {
  x: number;
  y: number;
  texture: MapItemTextureEnum;
}

export interface IMap {
  width: number;
  height: number;

  items: IMapItem[];
  physicalItems: IMapPhysicalItem[];
}

export class MapEntity {
  private readonly map: IMap;

  constructor(width: number, height: number) {
    this.map = {
      width: width,
      height: height,
      items: this.mapGenerate(width, height),
      physicalItems: this.physicalMapGenerate(width, height),
    };
  }

  public getSpawners() {

  }

  private physicalMapGenerate(width: number, height: number): IMapPhysicalItem[] {
    const items = [];
    const w = width * 2;
    const h = height * 2;
    for (let i = 0; i < h; i++) {
      for (let j = 0; j < w; j++) {
        let type = MapItemTypeEnum.EMPTY;
        if (i === 0 || i === h - 1 || j === 0 || j === w - 1) {
          type = MapItemTypeEnum.SOLID;
        }


        items.push({
          x: j,
          y: i,
          type: type,
        });
      }
    }

    return items;
  }

  private mapGenerate(width: number, height: number): IMapItem[] {
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
        });
      }
    }
    return arr;
  }

  public getMap() {
    return this.map;
  }
}
