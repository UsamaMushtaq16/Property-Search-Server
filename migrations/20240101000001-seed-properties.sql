INSERT INTO properties (title, site_type, acres, region, price, description) VALUES
(
  'Prime Brownfield Site - Salford',
  'brownfield', 12.50, 'North West', 150000000,
  'Former industrial site with planning permission for mixed-use development. Excellent transport links.'
),
(
  'Greenfield Agricultural Land - Lincolnshire',
  'greenfield', 45.00, 'Midlands', 320000000,
  'Grade 2 agricultural land with development potential. Adjacent to existing residential area.'
),
(
  'Commercial Development Plot - Canary Wharf',
  'commercial', 2.80, 'London', 980000000,
  'Premium commercial plot in established business district. Full planning consent obtained.'
),
(
  'Residential Site - Leeds City Centre',
  'residential', 3.20, 'Yorkshire', 85000000,
  'Cleared residential site with outline planning for 45 units. Close to all amenities.'
),
(
  'Brownfield Regeneration Site - Birmingham',
  'brownfield', 8.75, 'Midlands', 195000000,
  'Former factory site undergoing remediation. Suitable for residential or mixed-use.'
),
(
  'Greenfield Housing Land - Surrey',
  'greenfield', 6.10, 'South East', 420000000,
  'Allocated residential development land in Surrey village. Outline planning approved.'
),
(
  'Commercial Retail Park - Sheffield',
  'commercial', 15.40, 'Yorkshire', 275000000,
  'Large commercial plot suitable for retail park or logistics hub. A1/M1 access.'
),
(
  'Brownfield Waterfront - Liverpool',
  'brownfield', 5.50, 'North West', 225000000,
  'Historic docklands brownfield with stunning waterfront views. Mixed-use potential.'
),
(
  'Residential Estate Land - Nottingham',
  'residential', 22.00, 'Midlands', 140000000,
  'Large residential estate site on the outskirts of Nottingham. Planning consent pending.'
),
(
  'Greenfield Rural Plot - North Yorkshire',
  'greenfield', 50.00, 'Yorkshire', 95000000,
  'Expansive rural greenfield suitable for agricultural or equestrian use.'
),
(
  'Commercial Hub - Reading',
  'commercial', 4.30, 'South East', 510000000,
  'Strategic commercial site adjacent to Reading railway station. High footfall location.'
),
(
  'Brownfield Industrial - Newcastle',
  'brownfield', 18.20, 'North East', 120000000,
  'Large former industrial complex. Partially demolished and cleared. Excellent road access.'
),
(
  'Residential Infill Site - London',
  'residential', 0.75, 'London', 350000000,
  'Rare residential infill opportunity in sought-after South West London location.'
),
(
  'Greenfield Farm Land - Shropshire',
  'greenfield', 30.00, 'Midlands', 75000000,
  'Mixed arable and pasture land with farmhouse. Ideal for sustainable development.'
),
(
  'Brownfield Tech Campus - Cambridge',
  'brownfield', 9.60, 'South East', 780000000,
  'Former research facility brownfield with excellent potential for tech campus redevelopment.'
)
ON CONFLICT DO NOTHING;
