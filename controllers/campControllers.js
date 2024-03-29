import { cloudinary } from '../cloudinary/index.js';
import { Campground } from '../mongooseModels.js';
import { GeoCoder } from '../utils/mapBox.js';
const geoCoder = new GeoCoder();
const renderIndex = async (req, res) => {
	const campgrounds = await Campground.find({});
	res.render('campgrounds/index', { campgrounds });
};

const renderNewCampForm = (req, res) => {
	res.render('campgrounds/new'); // Renderizza il form per aggiungere un nuovo campeggio
};

const addCampFromUserForm = async (req, res) => {
	try {
		const { location } = req.body;
		const apiToken = process.env.MAPBOX_TOKEN;
		const coordinates = await geoCoder.localize(apiToken, location);
		const campground = new Campground(req.body);
		campground.geometry.type = 'Point';
		campground.geometry.coordinates = coordinates;
		campground.images = req.files.map((file) => ({ url: file.path, filename: file.filename }));
		campground.author = req.user._id;
		await campground.save();
		req.flash('success', 'campgroud Added!!');
		return res.redirect(`/campgrounds/${campground._id}`);
	} catch (error) {
		req.flash('error', 'eccoloooo il mongolo dislessico, riscrivi down di merda');
		return res.redirect(`/campgrounds/new`);
	}
};

const campDetailsPage = async (req, res) => {
	const { id } = req.params;
	const campground = await Campground.findById(id)
		.populate({ path: 'reviews', populate: { path: 'author' } })
		.populate('author');
	if (!campground) {
		req.flash('error', 'non esiste questo campground, idiota');
		return res.redirect('/campgrounds');
	}
	res.render('campgrounds/show', { campground }); // Renderizza la vista 'show' passando il campeggio trovato
};

const renderEditCampForm = async (req, res) => {
	const campground = await Campground.findById(req.params.id);
	if (!campground) {
		req.flash('error', 'questo campeggio esiste solo nella tua testa di merda');
		return res.redirect('/campgrounds');
	}
	res.render('campgrounds/edit', { campground }); // Renderizza il form di modifica passando il campeggio trovato
};

const editCampFromUserForm = async (req, res) => {
	const { id } = req.params;
	const editCamp = await Campground.findByIdAndUpdate(id, { ...req.body });
	const images = req.files.map((file) => ({ url: file.path, filename: file.filename }));
	editCamp.images.push(...images);
	await editCamp.save();
	if (req.body.deleteImages) {
		for (let filename of req.body.deleteImages) {
			cloudinary.uploader.destroy(filename);
		}
		await editCamp.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
	}
	req.flash('success', 'campground modificato!!');
	res.redirect(`/campgrounds/${editCamp._id}`);
};

const deleteCampFromUserForm = async (req, res) => {
	const { id } = req.params;
	const deletedCamp = await Campground.findByIdAndDelete(id);
	deletedCamp
		? req.flash('success', 'finalmente hai eliminato sta cazzo di palude')
		: req.flash('error', 'wei orlando furioso, ripigliati, ciò che cerchi non esiste');
	res.redirect('/campgrounds');
};
export {
	renderIndex,
	renderNewCampForm,
	addCampFromUserForm,
	campDetailsPage,
	renderEditCampForm,
	editCampFromUserForm,
	deleteCampFromUserForm,
};
