import { useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import {
  Category as CategoryIcon,
  List as ListIcon,
  AccountTree as SubCategoryIcon,
} from "@mui/icons-material";
import Categories from "./Categories";
import InvestmentTypeList from "../components/InvestmentTypes/InvestmentTypeList";
import SubCategoryList from "../components/SubCategories/SubCategoryList";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
      style={{ height: "100%" }}
    >
      {value === index && <Box sx={{ height: "100%" }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `settings-tab-${index}`,
    "aria-controls": `settings-tabpanel-${index}`,
  };
}

export default function Settings() {
  const [value, setValue] = useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="settings tabs"
          variant="fullWidth"
        >
          <Tab
            icon={<CategoryIcon />}
            iconPosition="start"
            label="Categories"
            {...a11yProps(0)}
          />
          <Tab
            icon={<ListIcon />}
            iconPosition="start"
            label="Investment Types"
            {...a11yProps(1)}
          />
          <Tab
            icon={<SubCategoryIcon />}
            iconPosition="start"
            label="Sub Categories"
            {...a11yProps(2)}
          />
        </Tabs>
      </Box>
      <Box sx={{ flexGrow: 1, overflow: "auto" }}>
        <TabPanel value={value} index={0}>
          <Categories />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <InvestmentTypeList />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <SubCategoryList />
        </TabPanel>
      </Box>
    </Box>
  );
}
