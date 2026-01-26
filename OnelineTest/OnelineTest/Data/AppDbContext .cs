using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using OnelineTest.Model;

namespace OnelineTest.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<FormMDL> Forms { get; set; }
        public DbSet<FormFieldsMDL> FormFields { get; set; }
        public DbSet<FieldConditionsMDL> FieldConditions { get; set; }
        public DbSet<FormSubmissionsMDL> FormSubmissions { get; set; }
        public DbSet<FormSubmissionValuesMDL> FormSubmissionValues { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ========================
            // Forms
            // ========================
            modelBuilder.Entity<FormMDL>(entity =>
            {
                entity.ToTable("Forms");

                entity.HasKey(e => e.FormId);

                entity.Property(e => e.FormName)
                    .IsRequired()
                    .HasMaxLength(200);

                entity.Property(e => e.Description)
                    .HasMaxLength(500);

                entity.Property(e => e.IsActive)
                    .HasDefaultValue(true);

                entity.Property(e => e.CreatedBy)
                    .HasMaxLength(100);

                entity.Property(e => e.CreatedOn)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("GETDATE()");
            });

            // ========================
            // FormFields
            // ========================
            modelBuilder.Entity<FormFieldsMDL>(entity =>
            {
                entity.ToTable("FormFields");

                entity.HasKey(e => e.FieldId);

                entity.Property(e => e.FieldLabel)
                    .IsRequired()
                    .HasMaxLength(200);

                entity.Property(e => e.FieldType)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(e => e.IsRequired)
                    .HasDefaultValue(false);

                entity.Property(e => e.IsActive)
                    .HasDefaultValue(true);

                entity.Property(e => e.DefaultValue)
                    .HasColumnType("nvarchar(max)");

                entity.Property(e => e.OptionsJson)
                    .HasColumnType("nvarchar(max)");

                entity.HasOne(e => e.Form)
       .WithMany(f => f.FormFields)
       .HasForeignKey(e => e.FormId)
       .OnDelete(DeleteBehavior.Cascade);
            });

            // ========================
            // FieldConditions
            // ========================
            modelBuilder.Entity<FieldConditionsMDL>(entity =>
            {
                entity.ToTable("FieldConditions");

                entity.HasKey(e => e.ConditionId);

                entity.Property(e => e.Operator)
                    .IsRequired()
                    .HasMaxLength(20);

                entity.Property(e => e.ComparisonValue)
                    .IsRequired()
                    .HasMaxLength(200);

                entity.Property(e => e.Action)
                    .IsRequired()
                    .HasMaxLength(20);

                entity.HasOne(e => e.Form)
           .WithMany()
           .HasForeignKey(e => e.FormId)
           .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.SourceField)
                    .WithMany()
                    .HasForeignKey(e => e.SourceFieldId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.TargetField)
                    .WithMany()
                    .HasForeignKey(e => e.TargetFieldId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // ========================
            // FormSubmissions
            // ========================
            modelBuilder.Entity<FormSubmissionsMDL>(entity =>
            {
                entity.ToTable("FormSubmissions");

                entity.HasKey(e => e.SubmissionId);

                entity.Property(e => e.SubmittedBy)
                    .HasMaxLength(100);

                entity.Property(e => e.SubmittedOn)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("GETDATE()");

                entity.HasOne(e => e.Form)
          .WithMany(f => f.FormSubmissions)
          .HasForeignKey(e => e.FormId)
          .OnDelete(DeleteBehavior.Cascade);
            });

            // ========================
            // FormSubmissionValues
            // ========================
            modelBuilder.Entity<FormSubmissionValuesMDL>(entity =>
            {
                entity.ToTable("FormSubmissionValues");

                entity.HasKey(e => e.ValueId);

                entity.Property(e => e.FieldValue)
                    .HasColumnType("nvarchar(max)");

                entity.HasOne(e => e.Submission)
         .WithMany(s => s.SubmissionValues)
         .HasForeignKey(e => e.SubmissionId)
         .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Field)
                    .WithMany()
                    .HasForeignKey(e => e.FieldId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
