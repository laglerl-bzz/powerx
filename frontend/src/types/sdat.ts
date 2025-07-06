type SdatData =  DataEntry[];

type DataEntry = {
  documentID: 'ID742' | 'ID735';
  interval: {
    startDateTime: string;
    endDateTime: string;
  };
  resolution: number
  data: DataPoint[];
};

type DataPoint = {
  sequence: number;
  volume: number;
};
