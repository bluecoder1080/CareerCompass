const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const pdfParse = require('pdf-parse');
const { body, validationResult } = require('express-validator');
const Resume = require('../models/Resume');
const Profile = require('../models/Profile');
const { protect } = require('../middleware/auth');
const mlService = require('../services/mlService');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/resumes');
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, and DOCX files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  }
});

// @desc    Get user's resumes
// @route   GET /api/resumes
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const resumes = await Resume.getUserResumes(req.user.id)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Resume.countDocuments({ 
      user: req.user.id, 
      isActive: true 
    });

    res.status(200).json({
      success: true,
      count: resumes.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
      data: resumes,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get specific resume
// @route   GET /api/resumes/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id,
      isActive: true,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    res.status(200).json({
      success: true,
      data: resume,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new resume
// @route   POST /api/resumes
// @access  Private
router.post('/', protect, [
  body('title').optional().trim().isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { title = 'My Resume' } = req.body;

    // Get user profile to populate resume
    const profile = await Profile.findOne({ user: req.user.id })
      .populate('user', 'firstName lastName email');

    const resume = new Resume({
      user: req.user.id,
      title,
    });

    // Populate from profile if available
    if (profile) {
      await resume.populateFromProfile(profile);
    }

    await resume.save();

    res.status(201).json({
      success: true,
      data: resume,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update resume
// @route   PUT /api/resumes/:id
// @access  Private
router.put('/:id', protect, async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id,
      isActive: true,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    // Update allowed fields
    const allowedFields = [
      'title', 'personalInfo', 'summary', 'experience', 'education',
      'skills', 'projects', 'certifications', 'awards', 'publications',
      'volunteer', 'languages', 'settings'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        resume[field] = req.body[field];
      }
    });

    await resume.save();

    res.status(200).json({
      success: true,
      data: resume,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Upload resume file
// @route   POST /api/resumes/:id/upload
// @access  Private
router.post('/:id/upload', protect, upload.single('resume'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id,
      isActive: true,
    });

    if (!resume) {
      // Clean up uploaded file
      await fs.unlink(req.file.path).catch(console.error);
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    // Extract text from PDF
    let extractedText = '';
    if (req.file.mimetype === 'application/pdf') {
      try {
        const fileBuffer = await fs.readFile(req.file.path);
        const pdfData = await pdfParse(fileBuffer);
        extractedText = pdfData.text;
      } catch (parseError) {
        console.error('PDF parsing error:', parseError);
        extractedText = 'Unable to extract text from PDF';
      }
    }

    // Update resume with file info
    resume.fileInfo = {
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedAt: new Date(),
    };

    if (extractedText) {
      resume.resumeText = extractedText;
      
      // Analyze resume with AI
      try {
        const analysis = await mlService.analyzeResume(extractedText);
        resume.aiAnalysis = {
          atsScore: analysis.atsScore,
          suggestions: analysis.suggestions,
          missingKeywords: analysis.missingKeywords,
          strengthAreas: analysis.strengthAreas,
          improvementAreas: analysis.improvementAreas,
          lastAnalyzed: new Date(),
        };
      } catch (aiError) {
        console.error('Resume AI analysis failed:', aiError);
        // Calculate basic ATS score
        resume.calculateATSScore();
      }
    }

    await resume.save();

    res.status(200).json({
      success: true,
      data: {
        fileInfo: resume.fileInfo,
        aiAnalysis: resume.aiAnalysis,
        extractedText: extractedText.substring(0, 500) + '...', // Preview
      },
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      await fs.unlink(req.file.path).catch(console.error);
    }
    next(error);
  }
});

// @desc    Analyze resume
// @route   POST /api/resumes/:id/analyze
// @access  Private
router.post('/:id/analyze', protect, [
  body('jobDescription').optional().trim().isLength({ max: 5000 }).withMessage('Job description too long'),
], async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id,
      isActive: true,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    if (!resume.resumeText && !resume.summary) {
      return res.status(400).json({
        success: false,
        message: 'No resume content to analyze. Please upload a resume file or add content.',
      });
    }

    const { jobDescription } = req.body;
    const resumeContent = resume.resumeText || resume.summary || '';

    try {
      const analysis = await mlService.analyzeResume(resumeContent, jobDescription);
      
      resume.aiAnalysis = {
        atsScore: analysis.atsScore,
        suggestions: analysis.suggestions,
        missingKeywords: analysis.missingKeywords,
        strengthAreas: analysis.strengthAreas,
        improvementAreas: analysis.improvementAreas,
        lastAnalyzed: new Date(),
      };

      await resume.save();

      res.status(200).json({
        success: true,
        data: resume.aiAnalysis,
      });
    } catch (aiError) {
      console.error('Resume analysis failed:', aiError);
      
      // Fallback to basic analysis
      const atsScore = resume.calculateATSScore();
      const basicAnalysis = {
        atsScore,
        suggestions: [
          'Add more quantifiable achievements',
          'Include relevant keywords for your target role',
          'Strengthen your professional summary',
        ],
        missingKeywords: ['leadership', 'project management', 'data analysis'],
        strengthAreas: ['Work experience', 'Education'],
        improvementAreas: ['Skills section', 'Achievements quantification'],
        lastAnalyzed: new Date(),
      };

      resume.aiAnalysis = basicAnalysis;
      await resume.save();

      res.status(200).json({
        success: true,
        data: basicAnalysis,
        warning: 'AI analysis unavailable, showing basic analysis',
      });
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Generate resume PDF
// @route   POST /api/resumes/:id/generate
// @access  Private
router.post('/:id/generate', protect, [
  body('format').optional().isIn(['pdf', 'docx', 'html']).withMessage('Invalid format'),
], async (req, res, next) => {
  try {
    const { format = 'pdf' } = req.body;

    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id,
      isActive: true,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    // For now, return a mock response
    // In a real implementation, you'd use libraries like puppeteer, jsPDF, or docx
    const fileName = `resume-${resume._id}-${Date.now()}.${format}`;
    const filePath = path.join(__dirname, '../uploads/generated', fileName);

    // Mock file generation
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    
    if (format === 'html') {
      const htmlContent = generateResumeHTML(resume);
      await fs.writeFile(filePath, htmlContent);
    } else {
      // For PDF/DOCX, you'd use appropriate libraries
      await fs.writeFile(filePath, `Mock ${format.toUpperCase()} content for resume: ${resume.title}`);
    }

    // Update resume with generated file info
    const existingFile = resume.generatedFiles.find(f => f.format === format);
    if (existingFile) {
      existingFile.fileName = fileName;
      existingFile.filePath = filePath;
      existingFile.generatedAt = new Date();
    } else {
      resume.generatedFiles.push({
        format,
        fileName,
        filePath,
        generatedAt: new Date(),
        fileSize: (await fs.stat(filePath)).size,
      });
    }

    await resume.save();

    res.status(200).json({
      success: true,
      data: {
        format,
        fileName,
        downloadUrl: `/api/resumes/${resume._id}/download/${format}`,
        generatedAt: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Download generated resume
// @route   GET /api/resumes/:id/download/:format
// @access  Private
router.get('/:id/download/:format', protect, async (req, res, next) => {
  try {
    const { format } = req.params;

    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id,
      isActive: true,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    const generatedFile = resume.generatedFiles.find(f => f.format === format);
    if (!generatedFile) {
      return res.status(404).json({
        success: false,
        message: 'Generated file not found. Please generate the resume first.',
      });
    }

    try {
      await fs.access(generatedFile.filePath);
    } catch {
      return res.status(404).json({
        success: false,
        message: 'File not found on disk. Please regenerate.',
      });
    }

    const mimeTypes = {
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      html: 'text/html',
    };

    res.setHeader('Content-Type', mimeTypes[format] || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${generatedFile.fileName}"`);
    
    const fileStream = require('fs').createReadStream(generatedFile.filePath);
    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
});

// @desc    Share resume
// @route   POST /api/resumes/:id/share
// @access  Private
router.post('/:id/share', protect, async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id,
      isActive: true,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    await resume.generateShareableLink();

    res.status(200).json({
      success: true,
      data: {
        shareableLink: resume.shareableLink,
        shareUrl: `${process.env.FRONTEND_URL}/resume/shared/${resume.shareableLink}`,
        isPublic: resume.isPublic,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get shared resume (public)
// @route   GET /api/resumes/shared/:shareId
// @access  Public
router.get('/shared/:shareId', async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      shareableLink: req.params.shareId,
      isPublic: true,
      isActive: true,
    }).populate('user', 'firstName lastName');

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Shared resume not found or no longer available',
      });
    }

    // Return public version without sensitive data
    const publicResume = {
      title: resume.title,
      personalInfo: resume.personalInfo,
      summary: resume.summary,
      experience: resume.experience,
      education: resume.education,
      skills: resume.skills,
      projects: resume.projects,
      certifications: resume.certifications,
      awards: resume.awards,
      volunteer: resume.volunteer,
      languages: resume.languages,
      settings: resume.settings,
      user: resume.user,
      updatedAt: resume.updatedAt,
    };

    res.status(200).json({
      success: true,
      data: publicResume,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete resume
// @route   DELETE /api/resumes/:id
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id,
      isActive: true,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    // Soft delete
    resume.isActive = false;
    await resume.save();

    // Clean up files
    if (resume.fileInfo?.filePath) {
      await fs.unlink(resume.fileInfo.filePath).catch(console.error);
    }

    resume.generatedFiles.forEach(async (file) => {
      if (file.filePath) {
        await fs.unlink(file.filePath).catch(console.error);
      }
    });

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Helper function to generate HTML resume
function generateResumeHTML(resume) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${resume.title}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #2c3e50; border-bottom: 1px solid #bdc3c7; padding-bottom: 5px; }
        .experience-item, .education-item { margin-bottom: 20px; }
        .date { color: #7f8c8d; font-style: italic; }
        .skills { display: flex; flex-wrap: wrap; gap: 10px; }
        .skill { background: #ecf0f1; padding: 5px 10px; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${resume.personalInfo?.firstName || ''} ${resume.personalInfo?.lastName || ''}</h1>
        <p>${resume.personalInfo?.email || ''} | ${resume.personalInfo?.phone || ''}</p>
        <p>${resume.personalInfo?.location?.city || ''}, ${resume.personalInfo?.location?.state || ''}</p>
    </div>
    
    ${resume.summary ? `
    <div class="section">
        <h2>Professional Summary</h2>
        <p>${resume.summary}</p>
    </div>
    ` : ''}
    
    ${resume.experience?.length ? `
    <div class="section">
        <h2>Experience</h2>
        ${resume.experience.map(exp => `
        <div class="experience-item">
            <h3>${exp.title} at ${exp.company}</h3>
            <p class="date">${exp.startDate ? new Date(exp.startDate).toLocaleDateString() : ''} - ${exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Present'}</p>
            <p>${exp.description || ''}</p>
            ${exp.achievements?.length ? `<ul>${exp.achievements.map(ach => `<li>${ach}</li>`).join('')}</ul>` : ''}
        </div>
        `).join('')}
    </div>
    ` : ''}
    
    ${resume.education?.length ? `
    <div class="section">
        <h2>Education</h2>
        ${resume.education.map(edu => `
        <div class="education-item">
            <h3>${edu.degree} in ${edu.field}</h3>
            <p>${edu.institution}</p>
            <p class="date">${edu.startDate ? new Date(edu.startDate).toLocaleDateString() : ''} - ${edu.endDate ? new Date(edu.endDate).toLocaleDateString() : 'Present'}</p>
        </div>
        `).join('')}
    </div>
    ` : ''}
    
    ${resume.skills?.length ? `
    <div class="section">
        <h2>Skills</h2>
        ${resume.skills.map(skillCategory => `
        <div>
            <h4>${skillCategory.category.charAt(0).toUpperCase() + skillCategory.category.slice(1)}</h4>
            <div class="skills">
                ${skillCategory.items.map(skill => `<span class="skill">${skill}</span>`).join('')}
            </div>
        </div>
        `).join('')}
    </div>
    ` : ''}
</body>
</html>
  `;
}

module.exports = router;
