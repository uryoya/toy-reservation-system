/** 集約 */
export type Aggregate<Id, IdKey extends string = "id"> = {
  readonly [K in IdKey]: Id;
} & {
  readonly __version: number; // リポジトリで使用する集約のバージョン管理
};

/** エンティティ */
export type Entity<Id, IdKey extends string = "id"> = {
  readonly [K in IdKey]: Id;
};
