import { Button, Card, Col, DatePicker, Row, Select, Space, Spin } from 'antd';
import locale from 'antd/lib/date-picker/locale/en_US';
import moment from 'moment';
import React, { useEffect, useMemo, useState } from 'react';
import { BarChartIcon, CaretDownIcon, NextIcon, PrevIcon } from '../../../components/CustomIcons/icons';
import BarGraph from '../../../components/graphs/bar-graph';
import { useExplorerWidget } from '../../../core/explorer';
import { customAxios } from '../../../hooks/axios';
import { getChartOptions, tooltipDefaultCallback } from '../../../utils/chart-options';
import { configHumanizeDuration } from '../../../utils/configHumanizeDuration';

const getRange = (view, pickerValue) => {
    const value = pickerValue.clone();
    let startDateTime = null;
    let endDateTime = null;
    switch (view) {
      case 'Month':
        startDateTime = value.clone().startOf('year');
        endDateTime = value.clone().endOf('year');
        break;
      case 'Week':
        startDateTime = value.clone().startOf('month');
        endDateTime = value.clone().endOf('month');
        break;
      case 'Day':
        startDateTime = value.clone().startOf('week');
        endDateTime = value.clone().endOf('week');
        break;
      default:
        startDateTime = value.clone().startOf('year');
        endDateTime = value.clone().endOf('year');
        break;
    }
    return [startDateTime, endDateTime];
  };

export default function ResourceUtilizationBarChart({api}) {
    //console.log("------------",api);
    
    const widget = useExplorerWidget<any>();

    const [widgetName, setWidgetName] = useState('');
    
    const [chartType, setChartType] = useState({
        yAxis: 'percent',
        stacked: true,
        hoverDataType: 'humanReadable',
      });

      const [selectedView, setSelectedView] = React.useState('Month');
      const [pickerValue, setPickerValue] = React.useState(moment());

      
      const tuneChartData = useMemo(() => {
        let pointsArr = [];
        let legendArr = [];
        let background = [];
        let labels = [];
        const data = api.preference?.data?.customPrefs || [];
        const filteredData = data.filter((d) => d.visible);
        const datasets = [];

        if (widget.data?.result?.length > 1) {
            //console.log("if --------->", widget);
            
            filteredData.forEach((d, index) => {
                const dataset = {
                  label: d.aliasName || d.name,
                  backgroundColor: d.color,
                  data: [],
                  extraData: [],
                };
                labels = [];
        
                //console.log("data-------->",dataset);
                //console.log("filtered data ",filteredData);
                
                
                widget.data?.result?.forEach((result) => {
                  labels.push(result.label);
                  if (chartType.hoverDataType === 'humanReadable') {
                    // set condition for human readable or not
                    dataset.extraData.push(
                      configHumanizeDuration(result.value[d.name], {
                        round: true,
                      }),
                    );
                  }
        
                  if (chartType.yAxis === 'percent') {
                    
                    const total: any = Object.values(result.value || {}).reduce(
                      (val: number, prevValue: number) => prevValue + (val || 0),
                      0,
                    );
                    //console.log(result);
                    dataset.data.push((result.value[d.name] / total) * 100);
                  } 
                  else {
                    dataset.data.push(result.value[d.name]);
                  }
                });
                //console.log("dataset",dataset);
                
                datasets.push(dataset);
              });
              //console.log("datasets",datasets);

              return {
                labels: labels,
                datasets,
              };
            }
            else {
                data.forEach((d) => {
                  
                  if (d.visible) {
                    const value = widget?.data?.[d.name];
                    pointsArr.push(value);
                    legendArr.push(d.aliasName || d.name);
                    background.push(d.color);
                    datasets.push({
                      label: d.aliasName || d.name,
                      backgroundColor: d.color,
                      data: Array.isArray(value) ? value : [value],
                    });
                  }
                });
              }

              return {
                labels: legendArr,
                datasets: [
                  {
                    labels: legendArr,
                    backgroundColor: background,
                    data: pointsArr,
                  },
                ],
              };
        
      },[widget.data, api.preference?.data?.customPrefs, chartType]);

      //console.log("tuneChartData",tuneChartData)

      const getData = async (type, range: any = [null, null]) => {

        console.log("range----->",moment(range[0]),moment(range[1]));
        
    
        const obj = {
          filters: [{
            query: [{
              startedTimeInUtc: {
                $gt: range[0] ? moment(range[0]).valueOf() : undefined,
                $lt: range[1] ? moment(range[1]).valueOf() : undefined,
              }
            }],
          
          filterKey: "date",
          filterValue: {
                $gt: range[0] ? moment(range[0]).valueOf() : undefined,
                $lt: range[1] ? moment(range[1]).valueOf() : undefined,
          } 
        }],
          
        };

        // console.log("obj------->",obj);
        
        
        if(type === "Month")
        {
            widget.setShowBusyLayer(true)
            const res = await customAxios(
                {
                  url: `tdata/sources/62be94481d8f51c243072502`,
                  method: 'post',
                },
                false,
                obj,
                'v2',
              );
              //console.log("res----Month",res);
              
              widget.setData({
                result: res.response[0].result,
                __name: api.preferences?.data?.name,
                __dataSourceId: api.preferences?.data?.dataSourceId,
              });
              widget.setShowBusyLayer(false)
        }
        else if(type === "Week")
        {
            widget.setShowBusyLayer(true)
            const res = await customAxios(
                {
                  url: `tdata/sources/6343b8ea7c7e804b6d70cdc9`,
                  method: 'post',
                },
                false,
                obj,
                'v2',
              );
              //console.log("res----Week",res);

              widget.setData({
                result: res.response[0].result,
                __name: api.preferences?.data?.name,
                __dataSourceId: api.preferences?.data?.dataSourceId,
              });
              widget.setShowBusyLayer(false)
              
        }
        else if(type === "Day")
        {
            widget.setShowBusyLayer(true)
            const res = await customAxios(
                {
                  url: `tdata/sources/6343b95b7c7e804b6d70e3d4`,
                  method: 'post',
                },
                false,
                obj,
                'v2',
              );

              //console.log("res----Day",res);
              
              widget.setData({
                result: res.response[0].result,
                __name: api.preferences?.data?.name,
                __dataSourceId: api.preferences?.data?.dataSourceId,
              });
              widget.setShowBusyLayer(false)
            
        }
        
      };

      const calendarView = React.useMemo(() => {
        switch (selectedView) {
          case 'Month':
            return 'year';
          case 'Week':
            return 'month';
          case 'Day':
            return 'week';
          default:
            return 'year';
        }
      }, [selectedView]);
    

      const onClickNext = () => {
        const value = pickerValue.clone();
        switch (selectedView) {
          case 'Month':
            value.add(1, 'year');
            break;
          case 'Week':
            value.add(1, 'month');
            break;
          case 'Day':
            value.add(1, 'week');
            break;
          default:
            value.add(1, 'year');
            break;
        }
        const range = getRange(selectedView, value);
        getData(selectedView, range);
        setPickerValue(value);
      };

      const onClickPrev = () => {
        const value = pickerValue.clone();
        switch (selectedView) {
          case 'Month':
            value.subtract(1, 'year');
            break;
          case 'Week':
            value.subtract(1, 'month');
            break;
          case 'Day':
            value.subtract(1, 'week');
            break;
          default:
            value.subtract(1, 'year');
            break;
        }
        const range = getRange(selectedView, value);
        getData(selectedView, range);
        setPickerValue(value);
      };
    
      React.useEffect(() => {
        setWidgetName(widget?.data?.__name || '');
      }, [widget?.data]);

    return (
        <div>
        {widget.data?.message === 'No data'  ? (
            <Space>
              <BarChartIcon style={{ fontSize: '16px', color: '#A8B1BD' }} />
              <span>Bar Chart</span>
            </Space>
          ) : (
          <Card
            className="resource-utilization-container"
            title="Resource utilization">
            <Row
              justify="space-between"
              align="bottom"
              wrap={false}
              className="mb-5">
              <span>
                <div className="text-neutral-4">View per</div>
                <Select
                  style={{ width: 100 }}
                  bordered
                  suffixIcon={<CaretDownIcon className="font-16 text-neutral-5" />}
                  defaultValue="Month"
                  value={selectedView}
                  onChange={async (view) => {
                    const range = getRange(view, pickerValue);
                    await getData(view, range);
                    setSelectedView(view);
                  }
                  }
                  >
                  <Select.Option value="Month">Months</Select.Option>
                  <Select.Option value="Week">Week</Select.Option>
                  <Select.Option value="Day">Day</Select.Option>
                </Select>
              </span>
              <Row align="middle">
                <Button  onClick={onClickPrev} icon={<PrevIcon />}>
                  Prev
                </Button>
                <Col flex={'1 1 auto'}>
                  <DatePicker
                    suffixIcon={false}
                    picker={calendarView}
                    bordered={false}
                    allowClear={false}
                    value={pickerValue}
                    onChange={async (value) => {
                      const range = getRange(selectedView, value);
                      setPickerValue(value);
    
                      await getData(selectedView, range);
                    }}
                    format={selectedView === 'Day' ? 'YYYY [w]WW' : undefined}
                    locale={locale}
                  />
                </Col>
                <Button onClick={onClickNext}>
                  Next <NextIcon className="font-16" /> 
                </Button>
              </Row>
            </Row>
            <div style={{ height: '322px' }}>
              <BarGraph data={tuneChartData} 
              options={getChartOptions({
                yAxesTickCallback: (value) =>
                  Number.isInteger(value)
                    ? chartType?.yAxis?.toLocaleLowerCase()?.includes('percent')
                      ? `${value}%`
                      : value
                    : null,
                xBarPercentage: 0.2,
                xAxesTickCallback: (str) => {
                  if (str?.length > 12) {
                    let subStr = str?.substring(0, 12);
                    return subStr + '...';
                  } else {
                    return str;
                  }
                },
                yAxisStacked: chartType.stacked,
                xAxisStacked: chartType.stacked,
                yAxisMax: chartType?.yAxis
                  ?.toLocaleLowerCase()
                  ?.includes('percent')
                  ? 100
                  : undefined,
                tooltipsLabelCallback:
                  chartType.hoverDataType === 'humanReadable'
                    ? tooltipDefaultCallback
                    : undefined,
              })}
              trimXaxisLabel={false}/>
            </div>
          </Card>
          )}
          </div>
      );
    
}