USE [OnlineTest];
GO

/* ===============================
   FORMS
   =============================== */
CREATE TABLE dbo.Forms (
    FormId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    FormName NVARCHAR(200) NOT NULL,
    Description NVARCHAR(500) NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_Forms_IsActive DEFAULT (1),
    CreatedBy NVARCHAR(100) NULL,
    CreatedOn DATETIME NOT NULL CONSTRAINT DF_Forms_CreatedOn DEFAULT (GETDATE())
);
GO

/* ===============================
   FORM FIELDS
   =============================== */
CREATE TABLE dbo.FormFields (
    FieldId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    FormId INT NOT NULL,
    FieldLabel NVARCHAR(200) NOT NULL,
    FieldType NVARCHAR(50) NOT NULL,
    IsRequired BIT NOT NULL CONSTRAINT DF_FormFields_IsRequired DEFAULT (0),
    DefaultValue NVARCHAR(MAX) NULL,
    OptionsJson NVARCHAR(MAX) NULL,
    SortOrder INT NOT NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_FormFields_IsActive DEFAULT (1),

    CONSTRAINT FK_FormFields_Forms
        FOREIGN KEY (FormId) REFERENCES dbo.Forms(FormId)
);
GO

/* ===============================
   FIELD CONDITIONS
   =============================== */
CREATE TABLE dbo.FieldConditions (
    ConditionId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    FormId INT NOT NULL,
    SourceFieldId INT NOT NULL,
    TargetFieldId INT NOT NULL,
    Operator NVARCHAR(20) NOT NULL,
    ComparisonValue NVARCHAR(200) NOT NULL,
    Action NVARCHAR(20) NOT NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_FieldConditions_IsActive DEFAULT (1),

    CONSTRAINT FK_FieldConditions_Forms
        FOREIGN KEY (FormId) REFERENCES dbo.Forms(FormId),

    CONSTRAINT FK_FieldConditions_SourceField
        FOREIGN KEY (SourceFieldId) REFERENCES dbo.FormFields(FieldId),

    CONSTRAINT FK_FieldConditions_TargetField
        FOREIGN KEY (TargetFieldId) REFERENCES dbo.FormFields(FieldId)
);
GO

/* ===============================
   FORM SUBMISSIONS
   =============================== */
CREATE TABLE dbo.FormSubmissions (
    SubmissionId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    FormId INT NOT NULL,
    SubmittedBy NVARCHAR(100) NULL,
    SubmittedOn DATETIME NOT NULL CONSTRAINT DF_FormSubmissions_SubmittedOn DEFAULT (GETDATE()),

    CONSTRAINT FK_FormSubmissions_Forms
        FOREIGN KEY (FormId) REFERENCES dbo.Forms(FormId)
);
GO

/* ===============================
   FORM SUBMISSION VALUES
   =============================== */
CREATE TABLE dbo.FormSubmissionValues (
    ValueId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    SubmissionId INT NOT NULL,
    FieldId INT NOT NULL,
    FieldValue NVARCHAR(MAX) NULL,

    CONSTRAINT FK_SubmissionValues_Submissions
        FOREIGN KEY (SubmissionId) REFERENCES dbo.FormSubmissions(SubmissionId),

    CONSTRAINT FK_SubmissionValues_Fields
        FOREIGN KEY (FieldId) REFERENCES dbo.FormFields(FieldId)
);
GO
