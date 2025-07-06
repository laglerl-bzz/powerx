type EslData =  MonthlyEntry[];

type MonthlyEntry = {
  month: string;
  data: ObisValue[];
};

type ObisValue = {
  obis: "1-1:1.8.1" | "1-1:1.8.2" | "1-1:2.8.1" | "1-1:2.8.2";
  value: number;
};
