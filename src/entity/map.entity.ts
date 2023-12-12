import { v4 as uuidv4 } from 'uuid';
import { DirectionsEnum } from './snake.entity';
import randomMax from '../utils/randomMax';
import { EatEntity } from './eat.entity';

export enum MapItemTextureEnum {}
export enum MapItemTypeEnum {
  SOLID = 'solid',
  EMPTY = 'empty',
}

export interface IMapPhysicalItem {
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
  private spawners: {
    id: string | null;
    x: number;
    y: number;
    directions: DirectionsEnum;
  }[] = [];

  private MAX_EATS = 12;
  private eats: Map<string, EatEntity> = new Map();

  constructor(width: number, height: number) {
    this.map = {
      width: width,
      height: height,
      items: this.mapGenerate(width, height),
      physicalItems: this.physicalMapGenerate(width, height),
    };

    this.generateSpawners();
  }

  public getSpawner(spawnID: string) {
    const candidate = this.spawners.find((spawn) => spawn.id === spawnID);

    if (candidate) {
      return candidate;
    }

    const emptySpawners = this.spawners.filter((spawn) => spawn.id === null);
    const randomEmptySpawner = emptySpawners[randomMax(emptySpawners.length)];
    const absoluteRandomEmptySpawner = this.spawners.find(
      (spawn) => spawn.directions === randomEmptySpawner.directions,
    );

    absoluteRandomEmptySpawner.id = spawnID;

    return absoluteRandomEmptySpawner;
  }

  public clearSpawner(spawnID: string): void {
    const candidate = this.spawners.find((spawn) => spawn.id === spawnID);

    if (candidate) {
      candidate.id = null;
    }
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

  private generateSpawners() {
    this.spawners.push({
      id: null,
      x: 8,
      y: 5,
      directions: DirectionsEnum.RIGHT,
    });

    this.spawners.push({
      id: null,
      x: this.map.width * 2 - 5,
      y: 8,
      directions: DirectionsEnum.DOWN,
    });

    this.spawners.push({
      id: null,
      x: this.map.width * 2 - 5,
      y: this.map.height * 2 - 8,
      directions: DirectionsEnum.LEFT,
    });

    this.spawners.push({
      id: null,
      x: 5,
      y: this.map.height * 2 - 8,
      directions: DirectionsEnum.UP,
    });
  }

  public getMap() {
    return this.map;
  }

  public createEat() {
    if (this.eats.size < this.MAX_EATS) {
      const emptyCell = this.getEmptyCeil();
      const eat = new EatEntity(emptyCell.x, emptyCell.y);
      this.eats.set(eat.getID(), eat);

      return eat;
    }
  }

  public getEats() {
    return this.eats;
  }

  public destroyEat(uuid: string) {
    this.eats.delete(uuid);
  }

  private getEmptyCeil() {
    const filteredCells = this.map.physicalItems.filter(
      (item) => item.type === MapItemTypeEnum.EMPTY,
    );

    this.eats.forEach((eat) => {
      const indexEatCeil = filteredCells.findIndex(
        (ceil) => ceil.x === eat.getX() && ceil.y === eat.getY(),
      );

      filteredCells.splice(indexEatCeil, 1);
    });

    return filteredCells[randomMax(filteredCells.length)];
  }
}
