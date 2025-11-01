import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Help as HelpIcon,
  Visibility as VisibilityIcon,
  Timeline as TimelineIcon,
  PhotoCamera as PhotoCameraIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { useLanguage } from "../contexts/LanguageContextSimple";

interface HelpDialogProps {
  open: boolean;
  onClose: () => void;
  type: "fibrogauge" | "hepasage";
}

const HelpDialog: React.FC<HelpDialogProps> = ({ open, onClose, type }) => {
  const { t } = useLanguage();

  const fibrogaugeContent = (
    <Box>
      <Typography variant="h6" gutterBottom color="primary">
        {t("help.fibrogauge.title")}
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        {t("help.fibrogauge.description")}
      </Typography>

      <Divider sx={{ my: 2 }} />

      {/* View Type Section */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <VisibilityIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">{t("help.view_type.title")}</Typography>
        </Box>
        <Typography variant="body2" paragraph>
          {t("help.view_type.description")}
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <Chip label="Intercostal" size="small" color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={t("help.view_type.intercostal.title")}
              secondary={t("help.view_type.intercostal.description")}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Chip label="Subcostal" size="small" color="secondary" />
            </ListItemIcon>
            <ListItemText
              primary={t("help.view_type.subcostal.title")}
              secondary={t("help.view_type.subcostal.description")}
            />
          </ListItem>
        </List>
      </Box>

      {/* SWE Stage Section */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <TimelineIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">{t("help.swe_stage.title")}</Typography>
        </Box>
        <Typography variant="body2" paragraph>
          {t("help.swe_stage.description")}
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <Chip
                label="F0"
                size="small"
                sx={{ bgcolor: "#4caf50", color: "white" }}
              />
            </ListItemIcon>
            <ListItemText
              primary={t("help.swe_stage.f0.title")}
              secondary={t("help.swe_stage.f0.description")}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Chip
                label="F1"
                size="small"
                sx={{ bgcolor: "#8bc34a", color: "white" }}
              />
            </ListItemIcon>
            <ListItemText
              primary={t("help.swe_stage.f1.title")}
              secondary={t("help.swe_stage.f1.description")}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Chip
                label="F2"
                size="small"
                sx={{ bgcolor: "#ff9800", color: "white" }}
              />
            </ListItemIcon>
            <ListItemText
              primary={t("help.swe_stage.f2.title")}
              secondary={t("help.swe_stage.f2.description")}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Chip
                label="F3"
                size="small"
                sx={{ bgcolor: "#f44336", color: "white" }}
              />
            </ListItemIcon>
            <ListItemText
              primary={t("help.swe_stage.f3.title")}
              secondary={t("help.swe_stage.f3.description")}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Chip
                label="F4"
                size="small"
                sx={{ bgcolor: "#9c27b0", color: "white" }}
              />
            </ListItemIcon>
            <ListItemText
              primary={t("help.swe_stage.f4.title")}
              secondary={t("help.swe_stage.f4.description")}
            />
          </ListItem>
        </List>
      </Box>

      {/* Setup Guide */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <SettingsIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">{t("help.setup.title")}</Typography>
        </Box>
        <Typography variant="body2" paragraph>
          {t("help.setup.description")}
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText
              primary={t("help.setup.step1")}
              secondary={t("help.setup.step1_detail")}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={t("help.setup.step2")}
              secondary={t("help.setup.step2_detail")}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={t("help.setup.step3")}
              secondary={t("help.setup.step3_detail")}
            />
          </ListItem>
        </List>
      </Box>
    </Box>
  );

  const hepasageContent = (
    <Box>
      <Typography variant="h6" gutterBottom color="primary">
        {t("help.hepasage.title")}
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        {t("help.hepasage.description")}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t("help.hepasage.features.title")}
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <PhotoCameraIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={t("help.hepasage.features.medical_qa")}
              secondary={t("help.hepasage.features.medical_qa_desc")}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <TimelineIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={t("help.hepasage.features.result_interpretation")}
              secondary={t("help.hepasage.features.result_interpretation_desc")}
            />
          </ListItem>
        </List>
      </Box>
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: 2,
          maxHeight: "80vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          bgcolor: "primary.main",
          color: "white",
        }}
      >
        <HelpIcon sx={{ mr: 1 }} />
        {t("help.dialog.title")}
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {type === "fibrogauge" ? fibrogaugeContent : hepasageContent}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="contained" color="primary">
          {t("help.dialog.close")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HelpDialog;
