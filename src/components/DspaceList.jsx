import { motion } from 'framer-motion';
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDspace, clearDspace } from "../redux/features/dSpaceSlice";
import {
  createDspacePayload,
  filterBy,
  defaultDspacePayload,
} from "../models/dspace/dspacePayload";
import { parseDspaceResponse } from "../models/dspace/dspaceResponse";
import { formatContributors } from '../models/dspace/contributors';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Pagination,
  Stack,
  TextField,
  Typography,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
} from "@mui/material";
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import pdfImage from '../assets/pdf.png';
import bookImage from '../assets/open-book.png';

export default function DspaceList() {
  const dispatch = useDispatch();
  const { data, status } = useSelector((state) => state.dspace);

  const parsed = parseDspaceResponse(data);

  const [filters, setFilters] = useState([]);
  const [field, setField] = useState("title");
  const [term, setTerm] = useState("");
  const [page, setPage] = useState(parsed.page || 1);
  const [size, setSize] = useState(parsed.size || 5);

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, staggerChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  };

  useEffect(() => {
    // initial load
    const payload = createDspacePayload({
      ...defaultDspacePayload,
      page: 1,
      size,
    });
    dispatch(fetchDspace(payload));
    return () => dispatch(clearDspace());
  }, [dispatch, size]);

  useEffect(() => {
    const payload = createDspacePayload({ filters, page, size });
    dispatch(fetchDspace(payload));
  }, [dispatch, filters, page, size]);

  const handleAddFilter = () => {
    if (!term) return;
    setFilters((f) => [...f, filterBy(field, term)]);
    setTerm("");
    setPage(1);
  };

  const handleRemoveFilter = (index) => {
    setFilters((f) => f.filter((_, i) => i !== index));
    setPage(1);
  };

  const handlePageChange = (_, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalPages = Math.max(1, Math.ceil((parsed.total || 0) / size));

  return (
    <section className="py-12 px-8 bg-gray-100 min-h-screen">
      <motion.div
        className="max-w-5xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h2
          className="text-3xl font-bold text-text-dark mb-6 text-center"
          variants={itemVariants}
        >
          Publicaciones UCE DSpace
        </motion.h2>
        <motion.div className="space-y-6" variants={itemVariants}>
          <Box className="container mx-auto pb-12 pt-6">
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems="center"
              mb={2}
            >
              <Select
                value={field}
                size="small"
                onChange={(e) => setField(e.target.value)}
              >
                <MenuItem value="title">Título</MenuItem>
                <MenuItem value="abstract">Resumen</MenuItem>
                <MenuItem value="subject">Tema</MenuItem>
              </Select>
              <TextField
                size="small"
                placeholder={field === 'subject' ? 'Nombre del tema' : 'Texto a buscar'}
                value={term}
                onChange={(e) => setTerm(e.target.value)}
              />
              <Button variant="contained" size="small" onClick={handleAddFilter}>
                Añadir filtro
              </Button>
              <Box sx={{ ml: "auto" }}>
                <Typography variant="caption">
                  Total: {parsed.total ?? 0}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} mb={3}>
              {filters.map((f, idx) => (
                <Chip
                  key={idx}
                  label={`${f.field}: ${f.value}`}
                  onDelete={() => handleRemoveFilter(idx)}
                />
              ))}
            </Stack>

            {status === "loading" && (
              <Box display="flex" justifyContent="center" my={4}>
                <CircularProgress />
              </Box>
            )}

            {status === "failed" && (
              <Typography color="error">Ocurrió un error al cargar las publicaciones</Typography>
            )}

            <Grid spacing={2} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {parsed.items.map((item, idx) => (
                <Grid item xs={12} sm={6} md={4} key={item.id || idx}>
                  <Card sx={{
                    transition: 'transform .14s ease, box-shadow .14s ease',
                    '&:hover': { transform: 'translateY(-3px) scale(1.007)', boxShadow: 3 },
                  }}>
                    <CardContent sx={{ cursor: item.source_url ? 'pointer' : 'default' }} onClick={() => {
                      if (item.source_url) window.open(item.source_url, '_blank', 'noopener,noreferrer');
                    }}>
                      <Box component="section" mb={3}>
                        <Typography variant="h6" mb={1}>{item.title || item.name || 'Sin título'}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatContributors(item.contributors)}
                        </Typography>
                        <Typography variant="body2" mt={1}>
                          {item.original_abstract
                            ? item.original_abstract.slice(0, 400) + (item.original_abstract.length > 400 ? ' ...' : '')
                            : ''}
                        </Typography>
                      </Box>

                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        spacing={1}
                      >
                        <Box>
                          <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={{ xs: 1, sm: 2 }}
                            alignItems={{ xs: 'flex-start', sm: 'center' }}
                          >
                            {item.extent ? (
                              <Box display="flex" alignItems="center" sx={{ mr: { xs: 0, sm: 2 }, mb: { xs: 0.5, sm: 0 } }}>
                                <img src={bookImage} alt="book" style={{ width: 24, height: 24, marginRight: 5 }} />
                                <Typography variant="caption">{item.extent}</Typography>
                              </Box>
                            ) : null}
                            <Box display="flex" alignItems="center" sx={{ mt: { xs: 0.5, sm: 0 } }}>
                              <CalendarTodayIcon fontSize="medium" sx={{ mr: 0.5 }} />
                              <Typography variant="caption">Publicado en {item.published_date || '-'}</Typography>
                              {item.pdf_url && (
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(item.pdf_url, '_blank', 'noopener,noreferrer');
                                  }}
                                  aria-label="Abrir PDF"
                                  sx={{
                                    ml: 2,
                                    p: 1,
                                    bgcolor: '#d2eaff',
                                    borderRadius: '8px',
                                    transition: 'transform .12s ease, background-color .12s ease',
                                    '&:hover': { transform: 'scale(1.12)', backgroundColor: '#b8dbff' },
                                  }}
                                >
                                  <img src={pdfImage} alt="pdf" style={{ width: 24, height: 24 }} />
                                </IconButton>
                              )}
                            </Box>
                          </Stack>
                        </Box>

                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ flexWrap: 'wrap', justifyContent: { xs: 'flex-start', sm: 'flex-end' }, mt: { xs: 1, sm: 0 } }}
                        >
                          {(() => {
                            const subjects = Array.isArray(item.subjects) ? item.subjects : [];
                            const visible = subjects.slice(0, 4);
                            const extra = subjects.length > 4 ? subjects.length - 4 : 0;
                            return (
                              <>
                                {visible.map((s) => (
                                  <Chip
                                    key={s.id || s.name}
                                    label={s.name}
                                    size="small"
                                    sx={{ backgroundColor: '#e6f0fa', borderRadius: '12px' }}
                                  />
                                ))}
                                {extra > 0 && (
                                  <Tooltip
                                    title={
                                      <Box sx={{ py: 0.25 }}>
                                        {subjects.slice(4).map((s) => (
                                          <Typography key={s.id || s.name} variant="caption" display="block">
                                            {s.name}
                                          </Typography>
                                        ))}
                                      </Box>
                                    }
                                    arrow
                                  >
                                    <Chip
                                      label={`+${extra}`}
                                      size="small"
                                      sx={{
                                        backgroundColor: '#f9e6f0',
                                        borderRadius: '999px',
                                        minWidth: 32,
                                        height: 24,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        px: 0,
                                        cursor: 'pointer',
                                      }}
                                    />
                                  </Tooltip>
                                )}
                              </>
                            );
                          })()}
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {parsed.items.length > 0 && ( 
              <Box display="flex" justifyContent="center" mt={4}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </Box>
        </motion.div>
      </motion.div>
      
    </section>
  );
}
