import React, { useEffect, useState } from 'react';
import { Button, Select, Space } from 'antd';
import { TestWidgetRenderer, useExplorerWidget } from '../../core/explorer';
import pluginController from '../../core/explorer/explorer-controller';
import DataSourceSettings from '../reusables/widget-data';
import {
  BarChartIcon,
  CaretDownIcon,
} from '../../components/CustomIcons/icons';
import BarGraph from '../../components/graphs/bar-graph';
import { getDataSources } from '../../core/explorer/widget-connector';
import { customAxios } from '../../hooks/axios';
import ChartDataEditor from '../reusables/charts/data-editor';
import WidgetFilterEditor from '../reusables/filters/widget-filter';
import WidgetView from '../reusables/charts/resource-utilization-bar-chart';
import moment from 'moment';


export const registerResourceBarChartWidget = () =>
  pluginController.registerPlugin('Resource-Utilization-Bar-chart', {
    title: 'Charts',
    supportedDashboardKeys: [
      'resource-self-dashboard',
    ],
    group: 'Charts',
    getData: async (api) => {
      if (api.preferences?.data?.dataSourceId) {
        let dateDetails = {};
        if (!Array.isArray(api.filterQuery?.filters)) {
          if (
            api.preferences?.data?.startDate &&
            api.preferences?.data?.endDate
          ) {
            dateDetails = {
              query: [
                {
                  addedTimeInUtc: {
                    $lt: api.preferences?.data?.endDate,
                    $gt: api.preferences?.data?.startDate,
                  },
                },
              ],
            };
          }
          const res = await customAxios(
            {
              url: `tdata/sources/${api.preferences?.data?.dataSourceId}`,
              method: 'post',
            },
            false,
            dateDetails,
            'v2',
          );
          if (res.response[0].result?.length > 1) {
            return {
              result: res.response[0].result,
              __name: api.preferences?.data?.name,
              __dataSourceId: api.preferences?.data?.dataSourceId,
            };
          }
          res.response[0].result[0]
            ? (res.response[0].result[0]['__name'] =
                api.preferences?.data?.name)
            : null;

          return res?.response[0]?.result[0];
        } else {
          dateDetails = api.filterQuery;
          const res = await customAxios(
            {
              url: `tdata/sources/${api.preferences?.data?.dataSourceId}`,
              method: 'post',
            },
            false,
            {
              filters: [{
                query: [{
                  startedTimeInUtc: {
                    $gt: moment().startOf('year').valueOf(),
                    $lt:  moment().endOf('year').valueOf(),
                  }
                }],
              
              filterKey: "date",
              filterValue: {
                  $gt: moment().startOf('year').valueOf(),
                  $lt:  moment().endOf('year').valueOf(),
              } 
            }],
              
            },
            'v2',
          );
          if (res.response[0].result?.length > 1) {
            return {
              result: res.response[0].result,
              __name: api.preferences?.data?.name,
              __dataSourceId: api.preferences?.data?.dataSourceId,
            };
          }
          res.response[0].result[0]
            ? (res.response[0].result[0]['__name'] =
                api.preferences?.data?.name)
            : null;

          return res?.response[0]?.result[0];
        }
      } else {
        return { message: 'No data' };
      }
    },

    DataEditor: (api) => {
      return <ChartDataEditor api={api} />;
    },
    WidgetFilter: (api) => {
      return <WidgetFilterEditor api={api} />;
    },
    Widget: (api) => {
      return <WidgetView api={api}/>;
    },
    handleGlobalFilterChange: async (api) => {
      if (api.preferences?.data?.dataSourceId) {
        const queryDetails = { filters: [] };
        const res = await customAxios(
          {
            url: `tdata/sources/${api.preferences?.data?.dataSourceId}`,
            method: 'post',
          },
          false,
          queryDetails,
          'v2',
        );

        (res?.response?.[0]?.filtersAvailaible || []).forEach((filter) => {
          api.registerGlobalFilter(filter.filterKey, filter);
        });
      } else {
        throw 'No filters attached';
      }
    },
    defaultLayout: {
      i: null,
      x: 0,
      y: 0,
      h: 2,
      w: 4,
    },
  });
