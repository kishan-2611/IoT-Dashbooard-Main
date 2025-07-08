'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { Grid } from '@mui/system';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import axios from 'axios';
import dayjs, { Dayjs } from 'dayjs';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';





const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface SensorData {
  id: number;
  TimeStamp: string;
  payload: PayloadData;
}

interface PayloadData {
  rainStatus: number;
  humidity: number;
  sunlight: number;
  soilMoister: number;
  id: number;
  TimeStamp: string;
  temperature: number;
}

const schema = zod.object({
  id: zod.number().min(1, { message: 'Id is required' }),
  date: zod
    .any()
    .refine((val) => dayjs.isDayjs(val) && val.isValid(), {
      message: 'Invalid date',
    }),
});

type Values = {
  id: number;
  date: Dayjs | null;
};

export default function Dashboard() {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [filterData, setFilterData] = useState<SensorData[]>([]);
  const [chartData, setChartData] = useState<{
    temperature: [number, number][];
    humidity: [number, number][];
    moisture: [number, number][];
    sunlight: [number, number][];
    rain: [number, number][];
  }>({
    temperature: [],
    humidity: [],
    moisture: [],
    sunlight: [],
    rain: [],
  });

  const {
    control,
    watch,
  } = useForm<Values>({
    defaultValues: {
      id: 0,
      date: null,
    },
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get(
        'https://g14527fbq1.execute-api.ap-southeast-2.amazonaws.com/data'
      );
      setSensorData(res.data);
      console.log('Fetched sensor data:', res.data);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const id = watch('id');
    const date = watch('date')?.format('YYYY/MM/DD');
    const filtered = sensorData.filter((entry) => {
      const entryDate = entry?.TimeStamp.split('/T')[0];
      return entry.id === id && entryDate === date;
    });
    setFilterData(filtered);
  }, [watch('date'), watch('id'), sensorData]);

  useEffect(() => {
    if (!filterData.length) return;

    const convertToUnixTimestamp = (ts: string): number => {
      const isoFormatted = ts.replace('/T', ';');
      const date = new Date(isoFormatted);
      return isNaN(date.getTime()) ? 0 : date.getTime() + 19800000;
    };

    setChartData({
      temperature: filterData.map((entry) => [convertToUnixTimestamp(entry.TimeStamp), entry.payload.temperature]),
      humidity: filterData.map((entry) => [convertToUnixTimestamp(entry.TimeStamp), entry.payload.humidity]),
      moisture: filterData.map((entry) => [convertToUnixTimestamp(entry.TimeStamp), entry.payload.soilMoister]),
      sunlight: filterData.map((entry) => [convertToUnixTimestamp(entry.TimeStamp), entry.payload.sunlight]),
      rain: filterData.map((entry) => [convertToUnixTimestamp(entry.TimeStamp), entry.payload.rainStatus]),
    });
  }, [filterData]);

  const getChartOptions = (title: string, color: string): ApexCharts.ApexOptions => ({
    chart: { type: 'area', height: 300, zoom: { autoScaleYaxis: true } },
    xaxis: { type: 'datetime', title: { text: 'Timestamp' } },
    yaxis: { title: { text: title } },
    dataLabels: { enabled: false },
    tooltip: { x: { format: 'dd MMM yyyy HH:mm:ss' } },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.9,
        stops: [0, 100],
      },
    },
    colors: [color],
  });

  return (
    <div className="p-6">
      <Grid container spacing={2}>
        <Grid >
          <Controller
            name="id"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel>Id</InputLabel>
                <Select {...field} label="Id">
                  <MenuItem value={1}>1</MenuItem>
                  <MenuItem value={2}>2</MenuItem>
                </Select>
              </FormControl>
            )}
          />
        </Grid>

        <Grid>
          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Date"
                  format="DD/MM/YYYY"
                  value={field.value}
                  onChange={(date) => field.onChange(date)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            )}
          />
        </Grid>
      </Grid>

      {filterData.length === 0 && (
        <div style={{
          display: 'flex',
          textAlign: 'center',
          justifyContent: 'center',
          marginTop: '20px',
          color: 'black',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          No data available for selected ID and Date.
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {filterData.length > 0 && (
          <>
            <div style={{ textAlign: 'center', color: '#00695c', fontWeight: 'bold' }}>Temperature</div>
            <ApexChart
              options={getChartOptions('Temperature', '#00695c')}
              series={[{ name: 'Temperature', data: chartData.temperature }]}
              type="area"
              height={300}
            />

            <div style={{ textAlign: 'center', color: '#008FFB', fontWeight: 'bold' }}>Humidity</div>
            <ApexChart
              options={getChartOptions('Humidity', '#008FFB')}
              series={[{ name: 'Humidity', data: chartData.humidity }]}
              type="area"
              height={300}
            />

            <div style={{ textAlign: 'center', color: '#00E396', fontWeight: 'bold' }}>Soil Moisture</div>
            <ApexChart
              options={getChartOptions('Soil Moisture', '#00E396')}
              series={[{ name: 'Soil Moisture', data: chartData.moisture }]}
              type="area"
              height={300}
            />

            <div style={{ textAlign: 'center', color: '#FEB019', fontWeight: 'bold' }}>Sunlight</div>
            <ApexChart
              options={getChartOptions('Sunlight', '#FEB019')}
              series={[{ name: 'Sunlight', data: chartData.sunlight }]}
              type="area"
              height={300}
            />

            <div style={{ textAlign: 'center', color: '#FF4560', fontWeight: 'bold' }}>Rain</div>
            <ApexChart
              options={getChartOptions('Rain', '#FF4560')}
              series={[{ name: 'Rain', data: chartData.rain }]}
              type="area"
              height={300}
            />
          </>
        )}
      </div>
    </div>
  );
}
